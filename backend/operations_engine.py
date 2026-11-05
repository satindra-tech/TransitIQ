import os
import json
import pandas as pd
import numpy as np

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

class OperationsEngine:
    def __init__(self, predictor):
        self.predictor = predictor
        
        # Load route catalog
        catalog_path = os.path.join(DATA_DIR, "routes_catalog.json")
        if os.path.exists(catalog_path):
            with open(catalog_path, "r", encoding="utf-8") as f:
                self.routes_catalog = json.load(f)
        else:
            self.routes_catalog = []
            
        # Fast route lookup
        self.routes_map = {r["route_num"]: r for r in self.routes_catalog}
        self._overview_cache = {}

    def evaluate_route(self, route_num, hour=9, day_of_week=0, service_type="Ordinary", custom_buses=None):
        r_info = self.routes_map.get(str(route_num).upper(), {})
        base_buses = custom_buses if custom_buses is not None else max(1, r_info.get("scheduled_buses", 2))
        
        pred = self.predictor.predict_hourly(
            route_num=route_num,
            hour=hour,
            day_of_week=day_of_week,
            scheduled_buses=base_buses,
            service_type=service_type
        )
        
        pred_demand = pred["predicted_demand"]
        hist_avg = pred["historical_avg"]
        total_cap = pred["total_capacity"]
        load_ratio = pred["load_ratio"]
        risk_level = pred["risk_level"]
        corridor = pred["corridor"]
        traffic_idx = pred["traffic_index"]
        depot = r_info.get("primary_depot", "Central Depot")
        origin = r_info.get("origin", "Chennai Central")
        destination = r_info.get("destination", "Destination")
        
        # Calculate passenger surplus/deficit
        unmet_demand = max(0.0, pred_demand - total_cap)
        excess_capacity = max(0.0, total_cap - pred_demand)
        
        # Anomaly detection
        dev_pct = round(((pred_demand - hist_avg) / max(1.0, hist_avg)) * 100, 1)
        if dev_pct >= 35.0:
            anomaly = "High Demand Surge"
            anomaly_desc = f"Ridership is {dev_pct}% above historical baseline ({int(pred_demand)} vs {int(hist_avg)} avg)."
            anomaly_level = "Critical"
        elif dev_pct <= -35.0:
            anomaly = "Abnormal Ridership Drop"
            anomaly_desc = f"Ridership dropped by {abs(dev_pct)}% below average. Potential route bottleneck or diversion."
            anomaly_level = "Warning"
        else:
            anomaly = "Normal Operation"
            anomaly_desc = f"Ridership is within typical statistical variance ({dev_pct}%)."
            anomaly_level = "Info"
            
        # Delay calculation based on corridor traffic and passenger crowding dwell times
        base_trip_duration_min = 45 # standard Chennai route average
        dwell_delay_min = 0.0
        if load_ratio > 1.25:
            dwell_delay_min = 6.5
        elif load_ratio > 1.0:
            dwell_delay_min = 3.5
            
        traffic_delay_min = round((traffic_idx - 1.0) * 20.0, 1)
        total_delay_min = round(traffic_delay_min + dwell_delay_min, 1)
        
        on_time_pct = max(40, min(98, round(100 - (total_delay_min * 2.5))))
        
        # Operational Recommendation Generator
        recommendations = self.generate_recommendations(
            route_num=route_num,
            origin=origin,
            destination=destination,
            depot=depot,
            corridor=corridor,
            load_ratio=load_ratio,
            risk_level=risk_level,
            unmet_demand=unmet_demand,
            pred_demand=pred_demand,
            current_buses=base_buses,
            total_delay=total_delay_min,
            anomaly=anomaly
        )
        
        return {
            "route_num": route_num,
            "origin": origin,
            "destination": destination,
            "corridor": corridor,
            "primary_depot": depot,
            "hour": hour,
            "day_of_week": day_of_week,
            "predicted_demand": pred_demand,
            "historical_baseline": hist_avg,
            "demand_deviation_pct": dev_pct,
            "scheduled_buses": base_buses,
            "total_capacity": total_cap,
            "load_ratio": load_ratio,
            "risk_level": risk_level,
            "unmet_demand": round(unmet_demand, 1),
            "excess_capacity": round(excess_capacity, 1),
            "traffic_index": traffic_idx,
            "estimated_delay_min": total_delay_min,
            "dwell_delay_min": dwell_delay_min,
            "schedule_adherence_pct": on_time_pct,
            "anomaly_status": anomaly,
            "anomaly_desc": anomaly_desc,
            "anomaly_level": anomaly_level,
            "recommendations": recommendations
        }

    def generate_recommendations(self, route_num, origin, destination, depot, corridor, load_ratio, risk_level, unmet_demand, pred_demand, current_buses, total_delay, anomaly):
        recs = []
        
        if risk_level == "Severely Overcrowded":
            needed_buses = max(1, int(np.ceil(unmet_demand / 55.0)))
            recs.append({
                "type": "FLEET_DEPLOYMENT",
                "priority": "CRITICAL",
                "badge": "Immediate Action",
                "title": f"Deploy {needed_buses} Standby Bus(es) from {depot}",
                "description": f"Route {route_num} is operating at {int(load_ratio * 100)}% capacity with {int(unmet_demand)} unboarded passengers. Inject {needed_buses} extra bus(es) immediately from {depot} standby reserve.",
                "action": "Deploy Standby Buses",
                "params": {"deploy_buses": needed_buses, "depot": depot},
                "expected_impact": f"Reduces load ratio to below 90% and eliminates curbside crowding.",
                "cost_indicator": "Medium"
            })
            recs.append({
                "type": "FREQUENCY_INCREASE",
                "priority": "HIGH",
                "badge": "Headway Compression",
                "title": f"Compress Headway to 6-8 mins on {corridor}",
                "description": f"Increase departure frequency from {depot} and {origin} to reduce passenger accumulation at intermediate stages.",
                "action": "Increase Service Frequency",
                "params": {"target_headway_min": 7},
                "expected_impact": "Prevents 45% of peak-station queuing delays.",
                "cost_indicator": "Low"
            })
            
        elif risk_level == "Overcrowded":
            recs.append({
                "type": "FREQUENCY_INCREASE",
                "priority": "HIGH",
                "badge": "Capacity Balancing",
                "title": f"Increase Frequency by +1 Trip/hr on Route {route_num}",
                "description": f"Demand of {int(pred_demand)} exceeds scheduled seat+stand capacity. Dispatch 1 additional scheduled trip.",
                "action": "Add Scheduled Trip",
                "params": {"deploy_buses": 1, "depot": depot},
                "expected_impact": "Restores load ratio to comfortable threshold (82%).",
                "cost_indicator": "Low"
            })
            
        if total_delay >= 12.0:
            recs.append({
                "type": "SHORT_LOOP_SERVICE",
                "priority": "MEDIUM",
                "badge": "Cut-Trip (CT) Shuttle",
                "title": f"Trigger Short-Loop Cut-Trip (CT) Shuttle",
                "description": f"Heavy bottleneck delay of {total_delay} mins observed along {corridor}. Inject a Cut-Trip (CT) shuttle between high-density intermediate transit hubs.",
                "action": "Activate Cut-Trip",
                "params": {"shuttle_type": "Point-to-Point Shuttle"},
                "expected_impact": "Bypasses congested endpoints and clears 35% of transfer traffic.",
                "cost_indicator": "Medium"
            })
            
        if load_ratio < 0.45 and current_buses >= 2:
            recs.append({
                "type": "FLEET_REALLOCATION",
                "priority": "LOW",
                "badge": "Efficiency Optimization",
                "title": f"Reallocate 1 Under-utilized Bus to Overcrowded Route",
                "description": f"Route {route_num} has low passenger load ({int(load_ratio * 100)}%). Shift 1 bus to high-demand routes (e.g. Route 570 or Route 21G) during this time slot.",
                "action": "Reallocate Bus",
                "params": {"reduce_buses": 1, "target_route": "570"},
                "expected_impact": "Saves operational fuel and relieves critical congestion in adjoining sector.",
                "cost_indicator": "Cost-Saving"
            })
            
        if not recs:
            recs.append({
                "type": "MAINTAIN_SCHEDULE",
                "priority": "INFO",
                "badge": "Optimal Status",
                "title": "Maintain Current Timetable & Monitoring",
                "description": f"Route {route_num} is operating within nominal load parameters ({int(load_ratio * 100)}%). Continue continuous sensor & ticketing telemetry.",
                "action": "Maintain Operations",
                "params": {},
                "expected_impact": "Schedule adherence expected > 92%.",
                "cost_indicator": "None"
            })
            
        return recs

    def get_network_overview(self, hour=9, day_of_week=0):
        """Evaluates all top routes for network-wide operational state with caching"""
        cache_key = (int(hour), int(day_of_week))
        if cache_key in self._overview_cache:
            return self._overview_cache[cache_key]

        evaluations = []
        for r in self.routes_catalog[:60]: # Top 60 active Chennai routes
            ev = self.evaluate_route(
                route_num=r["route_num"],
                hour=hour,
                day_of_week=day_of_week
            )
            evaluations.append(ev)
            
        total_demand = sum(e["predicted_demand"] for e in evaluations)
        total_cap = sum(e["total_capacity"] for e in evaluations)
        total_buses = sum(e["scheduled_buses"] for e in evaluations)
        avg_load = round(total_demand / max(1, total_cap), 3)
        
        # Risk counts
        risk_counts = {
            "Normal": sum(1 for e in evaluations if e["risk_level"] == "Normal"),
            "Moderate": sum(1 for e in evaluations if e["risk_level"] == "Moderate"),
            "Overcrowded": sum(1 for e in evaluations if e["risk_level"] == "Overcrowded"),
            "Severely Overcrowded": sum(1 for e in evaluations if e["risk_level"] == "Severely Overcrowded")
        }
        
        # Anomalies count
        surges = sum(1 for e in evaluations if e["anomaly_status"] == "High Demand Surge")
        delays_over_10m = sum(1 for e in evaluations if e["estimated_delay_min"] >= 10.0)
        
        # Corridor breakdown
        corridors_summary = {}
        for e in evaluations:
            c = e["corridor"]
            if c not in corridors_summary:
                corridors_summary[c] = {"corridor": c, "demand": 0, "capacity": 0, "overcrowded_routes": 0, "total_routes": 0}
            corridors_summary[c]["demand"] += e["predicted_demand"]
            corridors_summary[c]["capacity"] += e["total_capacity"]
            corridors_summary[c]["total_routes"] += 1
            if e["risk_level"] in ["Overcrowded", "Severely Overcrowded"]:
                corridors_summary[c]["overcrowded_routes"] += 1
                
        corridor_list = []
        for c, v in corridors_summary.items():
            v["avg_load_pct"] = round((v["demand"] / max(1, v["capacity"])) * 100, 1)
            corridor_list.append(v)
        corridor_list.sort(key=lambda x: x["avg_load_pct"], reverse=True)
        
        result = {
            "evaluated_hour": hour,
            "day_of_week": day_of_week,
            "total_monitored_routes": len(evaluations),
            "total_predicted_demand": int(total_demand),
            "total_fleet_capacity": int(total_cap),
            "active_scheduled_buses": total_buses,
            "network_avg_load_ratio": avg_load,
            "network_avg_load_pct": round(avg_load * 100, 1),
            "risk_distribution": risk_counts,
            "critical_overcrowded_count": risk_counts["Severely Overcrowded"],
            "warning_overcrowded_count": risk_counts["Overcrowded"],
            "high_surge_anomalies": surges,
            "significant_delays_count": delays_over_10m,
            "corridors_breakdown": corridor_list,
            "route_evaluations": evaluations
        }
        self._overview_cache[cache_key] = result
        return result
