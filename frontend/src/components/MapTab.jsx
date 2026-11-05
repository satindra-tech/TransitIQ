import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Layers, 
  Filter, 
  Info, 
  Eye, 
  EyeOff, 
  Activity, 
  ArrowRight,
  Maximize2,
  RefreshCw,
  Sliders,
  Key,
  Check,
  ExternalLink,
  ShieldCheck,
  Satellite,
  Navigation,
  Clock
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const RISK_COLORS = {
  'Normal': '#10B981',
  'Moderate': '#3B82F6',
  'Overcrowded': '#F59E0B',
  'Severely Overcrowded': '#EF4444'
};

export default function MapTab({ 
  hour = 9, 
  dayOfWeek = 0, 
  onSelectRoute,
  onSimulateRoute,
  isDarkMode = false 
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const routesLayerGroupRef = useRef(null);
  const stopsLayerGroupRef = useRef(null);

  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCorridor, setSelectedCorridor] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [showStops, setShowStops] = useState(true);
  const [activeRouteDetail, setActiveRouteDetail] = useState(null);

  // Google Maps Integration State
  const [googleApiKey, setGoogleApiKey] = useState(() => {
    return localStorage.getItem('transitiq_google_maps_key') || '';
  });
  const [tempApiKey, setTempApiKey] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [mapLayerType, setMapLayerType] = useState('google_roadmap'); // 'google_roadmap', 'google_satellite', 'google_traffic', 'carto'
  const [keySavedToast, setKeySavedToast] = useState(false);

  // Live Fleet Timetable State (Module 4 & Feature 3)
  const [fleetSchedule, setFleetSchedule] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleFilter, setScheduleFilter] = useState('ALL');
  const [scheduleSearch, setScheduleSearch] = useState('');

  // 1. Fetch Backend Settings, Map Data & Fleet Timetable
  useEffect(() => {
    // Check if backend has a configured Google Maps key
    fetch('/api/settings/google-maps-key')
      .then(r => r.json())
      .then(data => {
        if (data.api_key && !googleApiKey) {
          setGoogleApiKey(data.api_key);
          localStorage.setItem('transitiq_google_maps_key', data.api_key);
        }
      })
      .catch(err => console.error(err));

    setLoading(true);
    fetch(`/api/map-data?hour=${hour}&day_of_week=${dayOfWeek}`)
      .then(res => res.json())
      .then(data => {
        setMapData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching map data:', err);
        setLoading(false);
      });

    // Fetch Live Fleet Schedule
    setScheduleLoading(true);
    fetch(`/api/live-operations/fleet-schedule?hour=${hour}&day_of_week=${dayOfWeek}`)
      .then(res => res.json())
      .then(data => {
        setFleetSchedule(data.trips || []);
        setScheduleLoading(false);
      })
      .catch(err => {
        console.error('Error fetching fleet schedule:', err);
        setScheduleLoading(false);
      });
  }, [hour, dayOfWeek]);

  // Helper function to resolve tile layer config based on selected layer
  const getTileConfig = (type, dark, key) => {
    const keyParam = key ? `&key=${encodeURIComponent(key)}` : '';
    
    switch (type) {
      case 'google_roadmap':
        return {
          url: `https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}${keyParam}`,
          options: {
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            maxZoom: 20,
            attribution: '&copy; Google Maps Platform &copy; CUMTA MTC'
          }
        };
      case 'google_satellite':
        return {
          url: `https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}${keyParam}`,
          options: {
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            maxZoom: 20,
            attribution: '&copy; Google Maps Platform &copy; CUMTA MTC'
          }
        };
      case 'google_traffic':
        return {
          url: `https://{s}.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}${keyParam}`,
          options: {
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            maxZoom: 20,
            attribution: '&copy; Google Maps Platform &copy; CUMTA MTC'
          }
        };
      case 'carto':
        return {
          url: dark
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
          options: {
            subdomains: 'abcd',
            maxZoom: 20,
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO &copy; CUMTA MTC'
          }
        };
      case 'osm':
      default:
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          options: {
            subdomains: 'abc',
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors &copy; CUMTA MTC'
          }
        };
    }
  };

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    if (mapContainerRef.current._leaflet_id) {
      delete mapContainerRef.current._leaflet_id;
    }

    const map = L.map(mapContainerRef.current, {
      center: [13.0450, 80.2200],
      zoom: 11,
      minZoom: 9,
      maxZoom: 19,
      zoomControl: true
    });

    const { url, options } = getTileConfig(mapLayerType, isDarkMode, googleApiKey);
    const tiles = L.tileLayer(url, options).addTo(map);

    tileLayerRef.current = tiles;
    routesLayerGroupRef.current = L.layerGroup().addTo(map);
    stopsLayerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current) {
        delete mapContainerRef.current._leaflet_id;
      }
    };
  }, []);

  // 3. Update Tile Layer when layer type, dark mode, or API key changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    const { url, options } = getTileConfig(mapLayerType, isDarkMode, googleApiKey);
    const newTiles = L.tileLayer(url, options).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTiles;
    mapInstanceRef.current.invalidateSize();
  }, [mapLayerType, isDarkMode, googleApiKey]);

  // 4. Render Routes & Bus Stops
  useEffect(() => {
    if (!mapInstanceRef.current || !mapData) return;

    const map = mapInstanceRef.current;
    routesLayerGroupRef.current.clearLayers();
    stopsLayerGroupRef.current.clearLayers();

    const features = mapData.routes_geojson?.features || [];

    const filteredFeatures = features.filter(f => {
      const p = f.properties;
      if (selectedCorridor !== 'ALL' && p.corridor !== selectedCorridor) return false;
      if (riskFilter !== 'ALL' && p.risk_level !== riskFilter) return false;
      return true;
    });

    filteredFeatures.forEach(feature => {
      const p = feature.properties || {};
      const coords = feature.geometry?.coordinates;
      if (!coords || !Array.isArray(coords) || coords.length === 0) return;

      const validCoords = coords.filter(c => Array.isArray(c) && c.length >= 2 && !isNaN(c[0]) && !isNaN(c[1]));
      if (validCoords.length < 2) return;

      const latLngs = validCoords.map(c => [c[1], c[0]]);
      const color = RISK_COLORS[p.risk_level] || '#0d9488';
      const isSevere = p.risk_level === 'Severely Overcrowded';
      const weight = isSevere ? 5 : 3.5;
      const opacity = isSevere ? 0.95 : 0.8;

      const polyline = L.polyline(latLngs, {
        color: color,
        weight: weight,
        opacity: opacity,
        lineCap: 'round',
        lineJoin: 'round'
      });

      polyline.on('mouseover', () => {
        polyline.setStyle({ weight: weight + 2.5, opacity: 1.0 });
      });
      polyline.on('mouseout', () => {
        polyline.setStyle({ weight: weight, opacity: opacity });
      });

      polyline.on('click', () => {
        setActiveRouteDetail(p);
        try {
          const bounds = polyline.getBounds();
          if (bounds && bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
          }
        } catch (e) {
          console.warn('Could not fit bounds for route', p.route_num, e);
        }
      });

      polyline.bindTooltip(
        `<div style="font-family: inherit;">
          <strong style="font-size: 13px;">Route ${p.route_num || ''}</strong><br/>
          <span style="font-size: 11px; color: #64748b;">${p.source || ''} → ${p.destination || ''}</span><br/>
          <span style="color:${color}; font-weight:bold; font-size: 12px;">${p.risk_level || 'Normal'} (${Math.round((p.load_ratio || 0) * 100)}% Load)</span>
        </div>`,
        { sticky: true, className: 'leaflet-dark-tooltip' }
      );

      polyline.addTo(routesLayerGroupRef.current);
    });

    if (showStops && Array.isArray(mapData.bus_stops)) {
      mapData.bus_stops.slice(0, 150).forEach(stop => {
        if (!stop || isNaN(stop.lat) || isNaN(stop.lon)) return;
        const marker = L.circleMarker([stop.lat, stop.lon], {
          radius: 3.5,
          fillColor: '#0d9488',
          color: '#ffffff',
          weight: 1.5,
          opacity: 0.9,
          fillOpacity: 0.8
        });

        marker.bindTooltip(`🚏 <strong>${stop.name || 'Bus Stop'}</strong><br/><span style="font-size: 10px; color: #64748b;">${stop.zone || 'Chennai'} Zone</span>`, {
          direction: 'top',
          className: 'leaflet-dark-tooltip'
        });

        marker.addTo(stopsLayerGroupRef.current);
      });
    }

    map.invalidateSize();
  }, [mapData, selectedCorridor, riskFilter, showStops]);

  // Handle Save API Key
  const handleSaveApiKey = () => {
    const cleanKey = tempApiKey.trim();
    setGoogleApiKey(cleanKey);
    localStorage.setItem('transitiq_google_maps_key', cleanKey);

    // Save to backend
    fetch('/api/settings/google-maps-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: cleanKey })
    }).catch(err => console.error(err));

    setKeySavedToast(true);
    setTimeout(() => {
      setKeySavedToast(false);
      setShowKeyModal(false);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* 1. Map Controls & Google Maps API Integration Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Live Operations Route Network Map
                </h3>
                {googleApiKey ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" /> Google Maps API Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                    <Key className="w-3 h-3 text-amber-500" /> Google Key Optional
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visualizing Chennai MTC bus routes, stops, and live traffic on Google Maps layers
              </p>
            </div>
          </div>

          {/* Google Maps API Key Setup Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTempApiKey(googleApiKey);
                setShowKeyModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition shadow-xs"
            >
              <Key className="w-3.5 h-3.5 text-teal-600" />
              <span>{googleApiKey ? 'Edit Google API Key' : 'Input Google Maps Key'}</span>
            </button>
          </div>
        </div>

        {/* 2. Layer & Filter Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Base Layer Selector (Google Roadmap, Satellite, Traffic, Open Transit) */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
            <span className="text-[11px] font-bold text-slate-500 px-2">Map Layer:</span>
            <button
              onClick={() => setMapLayerType('google_roadmap')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                mapLayerType === 'google_roadmap'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              🗺️ Google Streets
            </button>
            <button
              onClick={() => setMapLayerType('google_satellite')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                mapLayerType === 'google_satellite'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              🛰️ Satellite Hybrid
            </button>
            <button
              onClick={() => setMapLayerType('google_traffic')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                mapLayerType === 'google_traffic'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              🚦 Live Traffic
            </button>
            <button
              onClick={() => setMapLayerType('carto')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                mapLayerType === 'carto'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              🏙️ Vector Transit
            </button>
            <button
              onClick={() => setMapLayerType('osm')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                mapLayerType === 'osm'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              🌐 OpenStreetMap
            </button>
          </div>

          {/* Corridor & Risk Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1">
              <span className="text-slate-500 font-medium">Corridor:</span>
              <select
                value={selectedCorridor}
                onChange={(e) => setSelectedCorridor(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Corridors (Chennai)</option>
                <option value="OMR IT Expressway">OMR IT Expressway</option>
                <option value="GST Road Corridor">GST Road Corridor</option>
                <option value="Anna Salai Arterial">Anna Salai Arterial</option>
                <option value="Poonamallee High Road">Poonamallee High Road</option>
                <option value="Inner Ring Road (100ft)">Inner Ring Road (100ft)</option>
                <option value="North Chennai Coastal">North Chennai Coastal</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1">
              <span className="text-slate-500 font-medium">Risk:</span>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Risk Tiers</option>
                <option value="Severely Overcrowded">Severe (&ge;130%)</option>
                <option value="Overcrowded">Overcrowded (100-129%)</option>
                <option value="Moderate">Moderate (75-99%)</option>
                <option value="Normal">Normal (&lt;75%)</option>
              </select>
            </div>

            <button
              onClick={() => setShowStops(!showStops)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition ${
                showStops 
                  ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              {showStops ? <Eye className="w-3.5 h-3.5 text-teal-600" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Bus Stops</span>
            </button>

            <button
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.setView([13.0450, 80.2200], 11);
                }
              }}
              title="Reset view to Chennai Metropolitan Area"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-teal-600 font-semibold transition"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Center</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Map Canvas Container */}
      <div className="relative h-[620px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-900">
        <div 
          ref={mapContainerRef} 
          className="w-full h-full" 
          style={{ minHeight: '620px' }} 
        />

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-30 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200">
              <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
              <span>Rendering Google Maps &amp; Route Telemetry...</span>
            </div>
          </div>
        )}

        {/* Map Legend Overlay */}
        <div className="absolute bottom-5 left-5 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs shadow-lg space-y-2 pointer-events-auto max-w-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block text-[10px]">
              Overcrowding Status
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {mapLayerType.startsWith('google') ? 'Google Maps' : 'Open Transit'}
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-4 h-1.5 rounded-full bg-[#EF4444]"></span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">Severely Overcrowded (&ge;130%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1.5 rounded-full bg-[#F59E0B]"></span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">Overcrowded (100-129%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1.5 rounded-full bg-[#3B82F6]"></span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">Moderate (75-99%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1.5 rounded-full bg-[#10B981]"></span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">Normal (&lt;75%)</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600 border border-white"></span>
              <span>GCC, Tambaram, Avadi Bus Stops</span>
            </div>
          </div>
        </div>

        {/* Route Details Floating Drawer when clicked */}
        {activeRouteDetail && (
          <div className="absolute top-5 right-5 z-20 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 animate-in fade-in slide-in-from-right-4 pointer-events-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-lg text-teal-600 dark:text-teal-400">
                  Route {activeRouteDetail.route_num}
                </span>
                <StatusBadge 
                  status={activeRouteDetail.load_ratio >= 1.3 ? 'CRITICAL' : activeRouteDetail.load_ratio >= 1.0 ? 'HIGH' : activeRouteDetail.load_ratio >= 0.75 ? 'MODERATE' : 'LOW'} 
                  size="sm" 
                />
              </div>
              <button 
                onClick={() => setActiveRouteDetail(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-1">
              <div className="text-slate-900 dark:text-white font-bold">
                {activeRouteDetail.source} → {activeRouteDetail.destination}
              </div>
              <div className="text-slate-500">
                Corridor: <span className="text-slate-700 dark:text-slate-300 font-medium">{activeRouteDetail.corridor}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Predicted Demand</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {Math.round(activeRouteDetail.predicted_demand)} <span className="text-[10px] text-slate-400 font-normal">pax/hr</span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Total Bus Capacity</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {activeRouteDetail.capacity} <span className="text-[10px] text-slate-400 font-normal">seats+stand</span>
                </span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="text-slate-500">Capacity Utilization:</span>
                <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                  {Math.round(activeRouteDetail.load_ratio * 100)}%
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => onSelectRoute?.(activeRouteDetail.route_num)}
                className="flex-1 bg-teal-600 hover:bg-teal-500 text-white rounded-xl py-2 text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs"
              >
                Forecast <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onSimulateRoute?.(activeRouteDetail.route_num)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
                title="Test in Simulator"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Feature 3 & Module 4: Live Fleet Timetable & Delay Feed */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Live Fleet Timetable &amp; Schedule Adherence Board
              </h3>
              <StatusBadge status="ON TIME" size="sm" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparing scheduled departure timetables with live telemetry arrival estimates, corridor delays, and crowd occupancy
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {['ALL', 'DELAYED', 'ON TIME', 'CRITICAL'].map(f => (
              <button
                key={f}
                onClick={() => setScheduleFilter(f)}
                className={`px-3 py-1.5 rounded-xl border font-semibold transition ${
                  scheduleFilter === f
                    ? 'bg-teal-600 border-teal-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search timetable by Route (e.g. 5A, 570), Bus Plate (TN-01), or Stage..."
            value={scheduleSearch}
            onChange={(e) => setScheduleSearch(e.target.value)}
            className="w-full sm:w-80 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
          />
          <span className="text-xs text-slate-400 font-mono">
            Showing {fleetSchedule.filter(t => {
              if (scheduleFilter === 'DELAYED' && t.service_status !== 'DELAYED') return false;
              if (scheduleFilter === 'ON TIME' && t.service_status !== 'ON TIME') return false;
              if (scheduleFilter === 'CRITICAL' && t.crowd_status !== 'CRITICAL') return false;
              if (scheduleSearch) {
                const q = scheduleSearch.toLowerCase();
                return t.route_num.toLowerCase().includes(q) || t.bus_registration.toLowerCase().includes(q) || t.current_stage.toLowerCase().includes(q);
              }
              return true;
            }).length} active services
          </span>
        </div>

        {/* Timetable Table */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Route &amp; Bus ID</th>
                <th className="py-2.5 px-3">Current Intermediate Stage</th>
                <th className="py-2.5 px-3">Scheduled Arrival</th>
                <th className="py-2.5 px-3">Estimated Actual</th>
                <th className="py-2.5 px-3">Delay Duration</th>
                <th className="py-2.5 px-3">Service Status</th>
                <th className="py-2.5 px-3 text-right">Passenger Occupancy</th>
                <th className="py-2.5 px-3">Crowd Status</th>
                <th className="py-2.5 px-3">Data Origin</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {fleetSchedule
                .filter(t => {
                  if (scheduleFilter === 'DELAYED' && t.service_status !== 'DELAYED') return false;
                  if (scheduleFilter === 'ON TIME' && t.service_status !== 'ON TIME') return false;
                  if (scheduleFilter === 'CRITICAL' && t.crowd_status !== 'CRITICAL') return false;
                  if (scheduleSearch) {
                    const q = scheduleSearch.toLowerCase();
                    return t.route_num.toLowerCase().includes(q) || t.bus_registration.toLowerCase().includes(q) || t.current_stage.toLowerCase().includes(q);
                  }
                  return true;
                })
                .map((trip, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    {/* Route & Bus Plate */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs px-2 py-0.5 rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          Route {trip.route_num}
                        </span>
                        <div>
                          <span className="font-mono text-slate-800 dark:text-slate-200 block text-[11px] font-semibold">
                            {trip.bus_registration}
                          </span>
                          <span className="text-[10px] text-slate-400 block">{trip.depot}</span>
                        </div>
                      </div>
                    </td>

                    {/* Current Stage */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                        <span>{trip.current_stage}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block ml-4">{trip.origin} → {trip.destination}</span>
                    </td>

                    {/* Scheduled */}
                    <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300 font-semibold">
                      {trip.scheduled_arrival}
                    </td>

                    {/* Actual */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {trip.actual_arrival}
                    </td>

                    {/* Delay */}
                    <td className="py-3 px-3">
                      <span className={`font-mono font-bold text-xs ${trip.delay_minutes >= 10 ? 'text-rose-600 dark:text-rose-400' : trip.delay_minutes >= 5 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        +{trip.delay_minutes} mins
                      </span>
                    </td>

                    {/* Service Status */}
                    <td className="py-3 px-3">
                      <StatusBadge status={trip.service_status} size="sm" />
                    </td>

                    {/* Occupancy */}
                    <td className="py-3 px-3 text-right">
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {trip.passenger_count} <span className="text-slate-400 font-normal text-[11px]">/ {trip.capacity}</span>
                      </div>
                      <div className="w-20 ml-auto bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden mt-1">
                        <div 
                          className={`h-full rounded-full ${trip.utilization_pct >= 130 ? 'bg-rose-500' : trip.utilization_pct >= 100 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, trip.utilization_pct * 0.7)}%` }}
                        ></div>
                      </div>
                    </td>

                    {/* Crowd Status Badge */}
                    <td className="py-3 px-3">
                      <StatusBadge status={trip.crowd_status} size="sm" />
                    </td>

                    {/* Data Source */}
                    <td className="py-3 px-3">
                      <StatusBadge status={trip.data_label.includes('REAL') ? 'AI SUGGESTED' : 'SIMULATED'} size="sm" />
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onSelectRoute?.(trip.route_num)}
                        className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Google Maps API Key Setup Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Google Maps API Configuration
                  </h3>
                  <p className="text-[11px] text-slate-500">Live Operations High-Precision Layer</p>
                </div>
              </div>
              <button 
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="text-slate-700 dark:text-slate-300 font-bold block">
                Enter your Google Maps API Key:
              </label>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Your key enables Google Maps Roadmap, Satellite Hybrid, and live traffic layers across Chennai MTC routes. Saved locally in your browser and on your backend server.
              </p>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>Don't have a key yet?</span>
                <a 
                  href="https://console.cloud.google.com/google/maps-apis/overview" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center gap-1"
                >
                  Get Key from Google Cloud <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {keySavedToast && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Google Maps API Key applied &amp; saved!</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save &amp; Activate Google Maps</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
