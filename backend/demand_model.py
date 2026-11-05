import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import LabelEncoder

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODEL_DIR, exist_ok=True)

CSV_PATH = os.path.join(DATA_DIR, "processed_transit_data.csv")
MODEL_PATH = os.path.join(MODEL_DIR, "demand_rf_model.joblib")
META_PATH = os.path.join(MODEL_DIR, "model_metadata.json")

class DemandModelTrainer:
    def __init__(self):
        self.route_encoder = LabelEncoder()
        self.corridor_encoder = LabelEncoder()
        self.service_encoder = LabelEncoder()
        self.model = None
        self.metadata = {}

    def load_and_preprocess(self):
        if not os.path.exists(CSV_PATH):
            raise FileNotFoundError(f"Processed transit data not found at {CSV_PATH}")
            
        df = pd.read_csv(CSV_PATH)
        print(f"Loaded {len(df)} records for ML training.")
        
        # Clean route_num and string columns
        df["route_num"] = df["route_num"].astype(str)
        df["corridor"] = df["corridor"].fillna("Central Urban Arterial").astype(str)
        df["route_service_type"] = df["route_service_type"].fillna("Ordinary").astype(str)
        
        # Fit label encoders
        df["route_encoded"] = self.route_encoder.fit_transform(df["route_num"])
        df["corridor_encoded"] = self.corridor_encoder.fit_transform(df["corridor"])
        df["service_encoded"] = self.service_encoder.fit_transform(df["route_service_type"])
        
        feature_cols = [
            "route_encoded",
            "hour",
            "day_of_week",
            "is_weekend",
            "is_peak_hour",
            "traffic_congestion_index",
            "scheduled_buses",
            "corridor_encoded",
            "service_encoded",
            "historical_avg_demand"
        ]
        
        X = df[feature_cols]
        y = df["passenger_demand"]
        
        return X, y, df

    def train_and_evaluate(self):
        X, y, df = self.load_and_preprocess()
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, random_state=42
        )
        print(f"Train set: {len(X_train)} samples, Test set: {len(X_test)} samples")
        
        # Random Forest Regressor
        print("Training Random Forest Regressor...")
        rf = RandomForestRegressor(
            n_estimators=120,
            max_depth=16,
            min_samples_split=4,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        rf.fit(X_train, y_train)
        
        y_pred = rf.predict(X_test)
        
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        
        print("\n=== MODEL PERFORMANCE METRICS ===")
        print(f"R² Score:                 {r2:.4f} ({r2*100:.2f}%)")
        print(f"Mean Absolute Error (MAE): {mae:.2f} passengers")
        print(f"Root Mean Squared Error:   {rmse:.2f} passengers")
        
        # Feature importances
        feature_names = [
            "Route ID", "Hour of Day", "Day of Week", "Weekend Flag",
            "Peak Hour Flag", "Traffic Congestion Index", "Scheduled Buses",
            "Corridor Zone", "Service Type", "Historical Demand Baseline"
        ]
        importances = rf.feature_importances_
        feature_imp_list = [
            {"feature": name, "importance": round(float(imp) * 100, 2)}
            for name, imp in sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True)
        ]
        
        print("\n=== TOP FEATURE IMPORTANCES ===")
        for f in feature_imp_list:
            print(f"  {f['feature']}: {f['importance']}%")
            
        self.model = rf
        
        # Save bundle
        bundle = {
            "model": rf,
            "route_encoder": self.route_encoder,
            "corridor_encoder": self.corridor_encoder,
            "service_encoder": self.service_encoder,
            "feature_cols": list(X.columns)
        }
        joblib.dump(bundle, MODEL_PATH)
        print(f"Model bundle saved to: {MODEL_PATH}")
        
        # Save JSON metadata for frontend dashboards
        self.metadata = {
            "algorithm": "Random Forest Regressor (Ensemble Trees)",
            "n_estimators": 120,
            "max_depth": 16,
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "r2_score": round(float(r2), 4),
            "accuracy_pct": round(float(r2) * 100, 2),
            "mae": round(float(mae), 2),
            "rmse": round(float(rmse), 2),
            "feature_importances": feature_imp_list,
            "total_routes_trained": len(self.route_encoder.classes_),
            "known_corridors": list(self.corridor_encoder.classes_),
            "known_services": list(self.service_encoder.classes_)
        }
        with open(META_PATH, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f, indent=2)
        print(f"Model metadata saved to: {META_PATH}")
        
        return self.metadata

class TransitPredictor:
    def __init__(self):
        if not os.path.exists(MODEL_PATH):
            trainer = DemandModelTrainer()
            trainer.train_and_evaluate()
            
        bundle = joblib.load(MODEL_PATH)
        self.model = bundle["model"]
        self.route_encoder = bundle["route_encoder"]
        self.corridor_encoder = bundle["corridor_encoder"]
        self.service_encoder = bundle["service_encoder"]
        self.feature_cols = bundle["feature_cols"]
        
        # Precompute route historical averages
        df = pd.read_csv(CSV_PATH)
        self.historical_lookup = df.groupby(["route_num", "hour"])["passenger_demand"].mean().to_dict()
        self.route_corridor_lookup = df.groupby("route_num")["corridor"].first().to_dict()
        self.route_buses_lookup = df.groupby("route_num")["scheduled_buses"].median().to_dict()
        
    def predict_hourly(self, route_num, hour, day_of_week=0, scheduled_buses=None, service_type="Ordinary", traffic_index=None):
        r_str = str(route_num).upper().strip()
        corridor = self.route_corridor_lookup.get(r_str, "Central Urban Arterial")
        
        # Safe encode route
        if r_str in self.route_encoder.classes_:
            route_enc = self.route_encoder.transform([r_str])[0]
        else:
            route_enc = 0
            
        # Safe encode corridor
        if corridor in self.corridor_encoder.classes_:
            corridor_enc = self.corridor_encoder.transform([corridor])[0]
        else:
            corridor_enc = 0
            
        # Safe encode service
        if service_type in self.service_encoder.classes_:
            service_enc = self.service_encoder.transform([service_type])[0]
        else:
            service_enc = 0
            
        is_weekend = 1 if day_of_week in [5, 6] else 0
        is_peak = 1 if (8 <= hour <= 10 or 17 <= hour <= 20) else 0
        
        if scheduled_buses is None:
            scheduled_buses = max(1, int(self.route_buses_lookup.get(r_str, 3)))
            
        if traffic_index is None:
            traffic_index = 1.45 if is_peak else (1.20 if (7 <= hour <= 21) else 1.05)
            
        hist_avg = self.historical_lookup.get((r_str, hour), 45.0)
        
        input_data = pd.DataFrame([{
            "route_encoded": route_enc,
            "hour": hour,
            "day_of_week": day_of_week,
            "is_weekend": is_weekend,
            "is_peak_hour": is_peak,
            "traffic_congestion_index": traffic_index,
            "scheduled_buses": scheduled_buses,
            "corridor_encoded": corridor_enc,
            "service_encoded": service_enc,
            "historical_avg_demand": hist_avg
        }])
        
        pred_demand = max(5.0, float(self.model.predict(input_data)[0]))
        
        # Unit capacity
        cap_unit = 45 if "a/c" in service_type.lower() else (50 if "deluxe" in service_type.lower() else 60)
        total_capacity = scheduled_buses * cap_unit
        load_ratio = round(pred_demand / total_capacity, 3)
        
        if load_ratio < 0.75:
            risk = "Normal"
        elif load_ratio < 1.00:
            risk = "Moderate"
        elif load_ratio < 1.30:
            risk = "Overcrowded"
        else:
            risk = "Severely Overcrowded"
            
        return {
            "route_num": r_str,
            "hour": hour,
            "day_of_week": day_of_week,
            "predicted_demand": round(pred_demand, 1),
            "historical_avg": round(hist_avg, 1),
            "scheduled_buses": scheduled_buses,
            "total_capacity": total_capacity,
            "load_ratio": load_ratio,
            "risk_level": risk,
            "corridor": corridor,
            "traffic_index": traffic_index
        }
        
    def predict_24h_curve(self, route_num, day_of_week=0, service_type="Ordinary", custom_buses=None):
        hours = list(range(4, 23)) # 4 AM to 10 PM operating hours
        curve = []
        for h in hours:
            buses = custom_buses if custom_buses is not None else None
            pt = self.predict_hourly(route_num, h, day_of_week, scheduled_buses=buses, service_type=service_type)
            curve.append(pt)
        return curve

if __name__ == "__main__":
    trainer = DemandModelTrainer()
    trainer.train_and_evaluate()
    
    # Test predictor
    print("\nTesting Demand Predictor for Route 570 (OMR IT Corridor) at 09:00 AM:")
    pred = TransitPredictor()
    res = pred.predict_hourly("570", hour=9, day_of_week=0)
    print(json.dumps(res, indent=2))
