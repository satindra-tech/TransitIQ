import os
import glob
import re
import json
import pandas as pd
import numpy as np
import shapefile

BASE_DATA_DIR = r"C:\Users\pc\Downloads\Theme 4\Theme 4"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Chennai Corridors definition for categorization & traffic estimation
CORRIDORS = {
    "OMR IT Expressway": ["570", "102", "19B", "519", "AC-570", "570S", "102K", "95", "91"],
    "GST Road Corridor": ["21G", "70", "70A", "70C", "G18", "E18", "B18", "500", "500C", "66"],
    "Anna Salai Arterial": ["A1", "18A", "18B", "23C", "23M", "11G", "D70", "29C"],
    "Poonamallee High Road": ["54", "54B", "54P", "154", "53E", "53S", "101", "101X"],
    "Inner Ring Road (100ft)": ["48C", "27B", "114", "159", "159A", "77", "88A", "62", "583"],
    "North Chennai Coastal": ["1C", "1D", "6D", "56", "56D", "121", "121A", "159"]
}

def identify_corridor(route_code):
    clean = str(route_code).upper().strip()
    for corridor, routes in CORRIDORS.items():
        for r in routes:
            if clean == r or clean.startswith(r):
                return corridor
    return "Central Urban Arterial"

def get_traffic_index(corridor, hour, is_weekend):
    # Base traffic index (1.0 = free flow)
    base = 1.05
    if is_weekend:
        if 11 <= hour <= 21:
            return round(base + 0.20, 2)
        return round(base, 2)
    
    # Weekday congestion curves by corridor
    if corridor == "OMR IT Expressway":
        if 8 <= hour <= 11 or 17 <= hour <= 21:
            return round(base + 0.48, 2)
        elif 12 <= hour <= 16:
            return round(base + 0.18, 2)
    elif corridor == "GST Road Corridor":
        if 8 <= hour <= 11 or 17 <= hour <= 21:
            return round(base + 0.42, 2)
        elif 12 <= hour <= 16:
            return round(base + 0.22, 2)
    elif corridor == "Anna Salai Arterial":
        if 8 <= hour <= 11 or 17 <= hour <= 21:
            return round(base + 0.45, 2)
        elif 12 <= hour <= 16:
            return round(base + 0.25, 2)
    elif corridor == "Poonamallee High Road":
        if 8 <= hour <= 11 or 18 <= hour <= 21:
            return round(base + 0.38, 2)
    elif corridor == "Inner Ring Road (100ft)":
        if 8 <= hour <= 11 or 17 <= hour <= 20:
            return round(base + 0.40, 2)
    else:
        if 8 <= hour <= 11 or 17 <= hour <= 20:
            return round(base + 0.30, 2)
            
    return round(base + 0.08 if 7 <= hour <= 22 else base, 2)

def extract_bus_stops():
    """Extracts bus stops from GCC, Avadi, Tambaram Excel sheets"""
    stops_file = os.path.join(BASE_DATA_DIR, "Tambaram, Avadi, GCC Bus Stops List  1.xlsx")
    stops = []
    if os.path.exists(stops_file):
        xl = pd.ExcelFile(stops_file)
        for sheet in xl.sheet_names:
            df = pd.read_excel(stops_file, sheet_name=sheet)
            # Find lat, lon, name columns
            name_col = next((c for c in df.columns if 'bus stop' in c.lower() or 'name' in c.lower()), df.columns[1] if len(df.columns) > 1 else None)
            lat_col = next((c for c in df.columns if 'lat' in c.lower()), None)
            lon_col = next((c for c in df.columns if 'long' in c.lower() or 'lon' in c.lower()), None)
            
            if name_col and lat_col and lon_col:
                for _, row in df.iterrows():
                    name = str(row[name_col]).strip()
                    try:
                        lat = float(row[lat_col])
                        lon = float(row[lon_col])
                        if 12.5 <= lat <= 13.5 and 79.5 <= lon <= 80.5:
                            stops.append({
                                "name": name,
                                "lat": round(lat, 5),
                                "lon": round(lon, 5),
                                "zone": sheet
                            })
                    except (ValueError, TypeError):
                        continue
    print(f"Loaded {len(stops)} bus stops with valid GPS coordinates.")
    
    # Save bus stops sample and index
    with open(os.path.join(OUTPUT_DIR, "bus_stops.json"), "w", encoding="utf-8") as f:
        json.dump(stops[:500], f, indent=2) # Top 500 stops for fast frontend map rendering
    return stops

def extract_shapefile_routes():
    """Extracts bus route geometries from routes_merged.shp"""
    shp_file = os.path.join(BASE_DATA_DIR, "Public Transport", "MTC", "routes_merged.shp")
    routes_geo = {}
    if os.path.exists(shp_file):
        sf = shapefile.Reader(shp_file)
        for i, shape in enumerate(sf.shapes()):
            rec = sf.record(i).as_dict()
            route_num = str(rec.get("route_num", "")).strip().upper()
            if not route_num or route_num == "NONE":
                continue
            
            # Downsample points for efficient web map rendering
            pts = shape.points
            if len(pts) > 60:
                step = max(1, len(pts) // 50)
                sampled_pts = pts[::step]
                if sampled_pts[-1] != pts[-1]:
                    sampled_pts.append(pts[-1])
            else:
                sampled_pts = pts
            
            # Leaflet expects [lat, lng] format
            lat_lng_pts = [[round(p[1], 5), round(p[0], 5)] for p in sampled_pts if 12.5 <= p[1] <= 13.5 and 79.5 <= p[0] <= 80.5]
            
            if lat_lng_pts and route_num not in routes_geo:
                routes_geo[route_num] = {
                    "route_num": route_num,
                    "source": str(rec.get("source", "Origin")).strip(),
                    "destination": str(rec.get("destinat", "Destination")).strip(),
                    "route_id": float(rec.get("route_id", 0)),
                    "corridor": identify_corridor(route_num),
                    "coordinates": lat_lng_pts
                }
    print(f"Extracted {len(routes_geo)} unique route polylines from shapefile.")
    
    with open(os.path.join(OUTPUT_DIR, "routes_geometry.json"), "w", encoding="utf-8") as f:
        json.dump(routes_geo, f, indent=2)
    return routes_geo

def process_etm_tickets(routes_geo):
    """Samples and aggregates ETM ticket files across multiple representative days"""
    ticket_files = glob.glob(os.path.join(BASE_DATA_DIR, "ETM", "ETM", "Ticket-Data-*.csv.bz2"))
    ticket_files.sort()
    print(f"Found {len(ticket_files)} ticket datasets.")
    
    # We select 4 diverse days: 2026-03-01 (Sunday), 2026-03-02 (Monday), 2026-03-04 (Wednesday), 2026-03-07 (Saturday)
    selected_files = [f for f in ticket_files if any(d in f for d in ["2026-03-01", "2026-03-02", "2026-03-04", "2026-03-07"])]
    if not selected_files:
        selected_files = ticket_files[:4]
    
    print(f"Processing selected benchmark days: {[os.path.basename(f) for f in selected_files]}")
    
    records = []
    
    for fpath in selected_files:
        fname = os.path.basename(fpath)
        print(f"Reading {fname}...")
        try:
            # Read 150,000 tickets per day for statistical strength
            df_chunk = pd.read_csv(
                fpath,
                nrows=150000,
                compression="bz2",
                usecols=[
                    "depot", "schedule_no", "direction", "date", "time",
                    "passenger_count", "total_ticket_amount", "KM",
                    "route_service_type", "trip_no", "fleet_no",
                    "Trip_Origin", "Trip_Destination"
                ]
            )
            
            # Clean route
            def get_route(row):
                d = str(row["direction"])
                if d and "-" in d:
                    code = d.split("-")[0].strip()
                    code = re.sub(r'CT$', '', code).strip()
                    return code
                s = str(row["schedule_no"])
                parts = s.split("-")
                if len(parts) >= 2:
                    return parts[1]
                return "Unknown"
            
            df_chunk["route_num"] = df_chunk.apply(get_route, axis=1)
            # Parse hour
            df_chunk["hour"] = pd.to_datetime(df_chunk["time"], format="%H:%M:%S", errors="coerce").dt.hour
            df_chunk["passenger_count"] = pd.to_numeric(df_chunk["passenger_count"], errors="coerce").fillna(1)
            df_chunk["total_ticket_amount"] = pd.to_numeric(df_chunk["total_ticket_amount"], errors="coerce").fillna(10.0)
            df_chunk["KM"] = pd.to_numeric(df_chunk["KM"], errors="coerce").fillna(12.0)
            
            # Filter valid hours and routes
            df_chunk = df_chunk.dropna(subset=["hour", "route_num"])
            df_chunk["hour"] = df_chunk["hour"].astype(int)
            
            # Group by route_num, hour, date, depot, route_service_type
            grouped = df_chunk.groupby([
                "route_num", "date", "hour", "depot", "route_service_type"
            ]).agg(
                passenger_demand=("passenger_count", "sum"),
                total_revenue=("total_ticket_amount", "sum"),
                unique_buses=("fleet_no", "nunique"),
                total_trips=("trip_no", "nunique"),
                avg_trip_km=("KM", "mean"),
                sample_origin=("Trip_Origin", "first"),
                sample_destination=("Trip_Destination", "first")
            ).reset_index()
            
            records.append(grouped)
        except Exception as e:
            print(f"Error processing {fname}: {e}")
            continue

    if not records:
        raise RuntimeError("No records processed from ticket datasets.")
        
    combined_df = pd.concat(records, ignore_index=True)
    print(f"Aggregated records shape: {combined_df.shape}")
    
    # Parse date to extract day_of_week and weekend flag
    combined_df["parsed_date"] = pd.to_datetime(combined_df["date"], format="%d-%m-%Y", errors="coerce")
    combined_df["day_of_week"] = combined_df["parsed_date"].dt.dayofweek
    combined_df["day_name"] = combined_df["parsed_date"].dt.day_name()
    combined_df["is_weekend"] = combined_df["day_of_week"].apply(lambda x: 1 if x in [5, 6] else 0)
    
    # Mark peak hours: Morning Peak (08:00 - 10:00), Evening Peak (17:00 - 20:00)
    combined_df["is_peak_hour"] = combined_df["hour"].apply(lambda h: 1 if (8 <= h <= 10 or 17 <= h <= 20) else 0)
    
    # Assign corridor & traffic congestion index
    combined_df["corridor"] = combined_df["route_num"].apply(identify_corridor)
    combined_df["traffic_congestion_index"] = combined_df.apply(
        lambda r: get_traffic_index(r["corridor"], r["hour"], r["is_weekend"]), axis=1
    )
    
    # Base bus capacity estimation based on service type
    # Standard MTC Ordinary: 60 (seats + standing), Deluxe: 50, AC: 45
    def calc_capacity(row):
        st = str(row["route_service_type"]).lower()
        cap_per_bus = 45 if "a/c" in st or "ac" in st else (50 if "deluxe" in st else 60)
        # Active buses scheduled per hour is at least 1, scaled by trips
        buses = max(1, int(row["unique_buses"]))
        return buses * cap_per_bus, cap_per_bus, buses
        
    cap_info = [calc_capacity(r) for _, r in combined_df.iterrows()]
    combined_df["total_capacity"] = [c[0] for c in cap_info]
    combined_df["bus_capacity_unit"] = [c[1] for c in cap_info]
    combined_df["scheduled_buses"] = [c[2] for c in cap_info]
    
    # Calculate Load Ratio: Passenger Demand / Total Capacity
    combined_df["load_ratio"] = (combined_df["passenger_demand"] / combined_df["total_capacity"]).round(3)
    
    # Risk Level classification
    def classify_risk(ratio):
        if ratio < 0.75:
            return "Normal"
        elif ratio < 1.00:
            return "Moderate"
        elif ratio < 1.30:
            return "Overcrowded"
        else:
            return "Severely Overcrowded"
            
    combined_df["risk_level"] = combined_df["load_ratio"].apply(classify_risk)
    
    # Fill in route origin/destination from shapefile if available
    for idx, row in combined_df.iterrows():
        rnum = str(row["route_num"]).upper()
        if rnum in routes_geo:
            combined_df.at[idx, "origin"] = routes_geo[rnum]["source"]
            combined_df.at[idx, "destination"] = routes_geo[rnum]["destination"]
        else:
            combined_df.at[idx, "origin"] = str(row["sample_origin"])
            combined_df.at[idx, "destination"] = str(row["sample_destination"])
            
    # Calculate historical average for each route and hour
    route_hourly_avg = combined_df.groupby(["route_num", "hour"])["passenger_demand"].mean().to_dict()
    combined_df["historical_avg_demand"] = combined_df.apply(
        lambda r: round(route_hourly_avg.get((r["route_num"], r["hour"]), r["passenger_demand"]), 1), axis=1
    )
    
    # Detect Anomaly: ridership surge > +35% or unexpected drop < -40%
    combined_df["demand_deviation_pct"] = (
        (combined_df["passenger_demand"] - combined_df["historical_avg_demand"]) / 
        combined_df["historical_avg_demand"].replace(0, 1) * 100
    ).round(1)
    
    def detect_anomaly(row):
        dev = row["demand_deviation_pct"]
        if dev >= 35.0:
            return "High Surge"
        elif dev <= -40.0:
            return "Abnormal Drop"
        return "Normal Variance"
        
    combined_df["anomaly_status"] = combined_df.apply(detect_anomaly, axis=1)
    
    # Save processed dataframe
    output_csv = os.path.join(OUTPUT_DIR, "processed_transit_data.csv")
    combined_df.to_csv(output_csv, index=False)
    print(f"Processed transit data saved to: {output_csv} with {len(combined_df)} records.")
    
    # Extract Route Catalog for Dashboard (Top 50 high-frequency routes with full details)
    route_summary = combined_df.groupby("route_num").agg(
        total_passengers=("passenger_demand", "sum"),
        avg_load_ratio=("load_ratio", "mean"),
        max_load_ratio=("load_ratio", "max"),
        overcrowded_hours=("risk_level", lambda x: sum(x.isin(["Overcrowded", "Severely Overcrowded"]))),
        primary_depot=("depot", lambda x: x.mode()[0] if not x.mode().empty else "Central Depot"),
        corridor=("corridor", "first"),
        origin=("origin", "first"),
        destination=("destination", "first"),
        service_types=("route_service_type", lambda x: list(x.unique()))
    ).reset_index().sort_values(by="total_passengers", ascending=False)
    
    route_catalog = []
    for _, r in route_summary.iterrows():
        rnum = r["route_num"]
        has_geo = rnum in routes_geo
        route_catalog.append({
            "route_num": rnum,
            "origin": r["origin"] or "Chennai Central",
            "destination": r["destination"] or "Tambaram",
            "corridor": r["corridor"],
            "primary_depot": r["primary_depot"],
            "total_passengers": int(r["total_passengers"]),
            "avg_load_ratio": round(float(r["avg_load_ratio"]), 2),
            "max_load_ratio": round(float(r["max_load_ratio"]), 2),
            "overcrowded_hours": int(r["overcrowded_hours"]),
            "has_geometry": has_geo,
            "coordinates": routes_geo[rnum]["coordinates"] if has_geo else []
        })
        
    with open(os.path.join(OUTPUT_DIR, "routes_catalog.json"), "w", encoding="utf-8") as f:
        json.dump(route_catalog, f, indent=2)
    print(f"Saved route catalog with {len(route_catalog)} routes to routes_catalog.json.")
    
    return combined_df

if __name__ == "__main__":
    print("Starting Transit Data Processing Pipeline...")
    extract_bus_stops()
    routes_geo = extract_shapefile_routes()
    process_etm_tickets(routes_geo)
    print("Data Pipeline Completed Successfully!")
