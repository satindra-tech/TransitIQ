import os
import json
import numpy as np

BUS_TYPES = {
    "Standard": {"name": "Standard MTC Bus", "capacity": 60, "cost_factor": 1.0},
    "Deluxe": {"name": "Deluxe Superfast", "capacity": 50, "cost_factor": 1.25},
    "Electric": {"name": "Zero-Emission Electric Bus", "capacity": 70, "cost_factor": 0.85},
    "Mini-Bus": {"name": "MTC Feeder Mini-Bus", "capacity": 35, "cost_factor": 0.65}
}

class TransitSimulator:
    def __init__(self, predictor, operations_engine):
        self.predictor = predictor
        self.operations_engine = operations_engine

    def run_simulation(
        self,
        route_num="570",
        hour=9,
        day_of_week=0,
        additional_buses=2,
        bus_type="Standard",
        demand_modifier_pct=0.0,
        target_headway_min=None
    ):
        r_str = str(route_num).upper().strip()
        
        # 1. Baseline Evaluation
        base_eval = self.operations_engine.evaluate_route(
            route_num=r_str,
            hour=hour,
            day_of_week=day_of_week
        )
        
        base_buses = base_eval["scheduled_buses"]
        base_demand = base_eval["predicted_demand"]
        base_cap = base_eval["total_capacity"]
        base_load_ratio = base_eval["load_ratio"]
        base_risk = base_eval["risk_level"]
        base_delay = base_eval["estimated_delay_min"]
        
        # 2. Simulated Parameters
        sim_buses = max(1, base_buses + int(additional_buses))
        
        # Selected bus capacity
        bus_spec = BUS_TYPES.get(bus_type, BUS_TYPES["Standard"])
        unit_cap = bus_spec["capacity"]
        
        # Adjust demand based on modifier
        mod_factor = 1.0 + (float(demand_modifier_pct) / 100.0)
        sim_demand = round(base_demand * mod_factor, 1)
        
        sim_total_cap = sim_buses * unit_cap
        sim_load_ratio = round(sim_demand / max(1, sim_total_cap), 3)
        
        # New risk level
        if sim_load_ratio < 0.75:
            sim_risk = "Normal"
        elif sim_load_ratio < 1.00:
            sim_risk = "Moderate"
        elif sim_load_ratio < 1.30:
            sim_risk = "Overcrowded"
        else:
            sim_risk = "Severely Overcrowded"
            
        # Delta calculations
        load_ratio_change_pct = round(((sim_load_ratio - base_load_ratio) / max(0.01, base_load_ratio)) * 100, 1)
        
        base_unmet = max(0.0, base_demand - base_cap)
        sim_unmet = max(0.0, sim_demand - sim_total_cap)
        unmet_relieved = round(base_unmet - sim_unmet, 1)
        
        # Wait time reduction calculation
        base_headway = round(60.0 / max(1, base_buses), 1)
        sim_headway = round(60.0 / max(1, sim_buses), 1) if not target_headway_min else float(target_headway_min)
        wait_time_saved_min = round(max(0.0, (base_headway - sim_headway) / 2.0), 1)
        
        # Simulated delay reduction (less crowding dwell)
        dwell_reduction = 0.0
        if base_load_ratio > 1.0 and sim_load_ratio <= 0.95:
            dwell_reduction = 3.5
        sim_delay = max(2.0, round(base_delay - dwell_reduction, 1))
        
        # Operational Feasibility Score (0 to 100)
        feasibility_score = 95
        if sim_buses > base_buses + 4:
            feasibility_score -= 20 # depot standby constraint
        if sim_load_ratio > 1.2:
            feasibility_score -= 25
        elif sim_load_ratio < 0.4:
            feasibility_score -= 15 # under-utilized
        feasibility_score = max(20, min(100, feasibility_score))
        
        # Generate 24-hour comparative curve
        hours = list(range(5, 23))
        curve_comparison = []
        for h in hours:
            # Baseline curve point
            b_pred = self.predictor.predict_hourly(r_str, hour=h, day_of_week=day_of_week, scheduled_buses=base_buses)
            # Simulated curve point
            s_dem = round(b_pred["predicted_demand"] * mod_factor, 1)
            s_cap = sim_buses * unit_cap
            s_ratio = round(s_dem / max(1, s_cap), 3)
            
            curve_comparison.append({
                "hour": f"{h:02d}:00",
                "hour_num": h,
                "baseline_demand": b_pred["predicted_demand"],
                "baseline_capacity": b_pred["total_capacity"],
                "baseline_load_ratio": b_pred["load_ratio"],
                "simulated_demand": s_dem,
                "simulated_capacity": s_cap,
                "simulated_load_ratio": s_ratio
            })
            
        return {
            "route_num": r_str,
            "corridor": base_eval["corridor"],
            "primary_depot": base_eval["primary_depot"],
            "hour": hour,
            "day_of_week": day_of_week,
            "inputs": {
                "additional_buses": additional_buses,
                "bus_type": bus_type,
                "unit_capacity": unit_cap,
                "demand_modifier_pct": demand_modifier_pct,
                "simulated_headway_min": sim_headway
            },
            "baseline": {
                "buses": base_buses,
                "demand": base_demand,
                "capacity": base_cap,
                "load_ratio": base_load_ratio,
                "risk_level": base_risk,
                "unmet_demand": round(base_unmet, 1),
                "headway_min": base_headway,
                "estimated_delay_min": base_delay
            },
            "simulated": {
                "buses": sim_buses,
                "demand": sim_demand,
                "capacity": sim_total_cap,
                "load_ratio": sim_load_ratio,
                "risk_level": sim_risk,
                "unmet_demand": round(sim_unmet, 1),
                "headway_min": sim_headway,
                "estimated_delay_min": sim_delay
            },
            "impact": {
                "load_ratio_change_pct": load_ratio_change_pct,
                "unmet_demand_relieved": unmet_relieved,
                "wait_time_saved_min": wait_time_saved_min,
                "delay_saved_min": round(dwell_reduction, 1),
                "feasibility_score": feasibility_score,
                "status_improved": (sim_load_ratio < base_load_ratio) and (sim_risk != "Severely Overcrowded")
            },
            "hourly_curve": curve_comparison
        }
