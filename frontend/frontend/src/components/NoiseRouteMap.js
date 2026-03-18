import React, { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "./ui/badge";
import { Route as RouteIcon, Navigation } from "lucide-react";
import { useToast } from "../hooks/use-toast";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

// Fallback coordinate if Geolocation fails (Mysuru)
const DEFAULT_CENTER = [12.2958, 76.6394];

const ROUTE_COLOR = {
  Low: "#10b981",     // emerald
  Medium: "#f59e0b",  // amber
  High: "#ef4444",    // red
};

const levelVariants = {
  Low: "secondary",
  Medium: "default",
  High: "destructive",
};

const levelMessages = {
  Low: "Fastest route – optimal path with standard noise levels.",
  Medium: "Alternative route – moderate noise avoidance.",
  High: "Deep detour – maximum noise avoidance through quieter zones."
};

// Fix Leaflet's default marker icon issue with CRA/webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom "You" marker
const youIcon = L.divIcon({
  className: "",
  html: `<div style="display:flex;flex-direction:column;align-items:center">
           <div style="background:#fff;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700;box-shadow:0 1px 3px rgba(0,0,0,.2);margin-bottom:2px">YOU</div>
           <div style="width:14px;height:14px;background:#10b981;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>
         </div>`,
  iconSize: [40, 30],
  iconAnchor: [20, 30],
});

// Custom destination marker
const destIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;background:#ef4444;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center">
           <div style="width:6px;height:6px;background:#fff;border-radius:50%"></div>
         </div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Component to handle map clicks
function MapClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e);
    },
  });
  return null;
}

function NoiseRouteMap({ noiseLevel = "Low", hasAnalysis = true }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routes, setRoutes] = useState(null);
  const { toast } = useToast();
  const mapRef = useRef(null);

  useEffect(() => {
    if (!hasAnalysis) {
      toast({
        title: "Audio Analysis Required",
        description: "Upload and analyze audio first to properly calculate noise-aware routes.",
      });
    }
  }, [hasAnalysis, toast]);

  // 1. Get User's Present Location on Mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          console.warn("Geolocation permission denied or failed. Using default center.");
          setCurrentLocation(DEFAULT_CENTER);
        }
      );
    } else {
      setCurrentLocation(DEFAULT_CENTER);
    }
  }, []);

  // 2. Fetch Routes from Mapbox Directions API
  const fetchRoutes = useCallback(async (start, end) => {
    if (!start || !end || !MAPBOX_TOKEN) return;

    try {
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[1]},${start[0]};${end[1]},${end[0]}?alternatives=true&geometries=geojson&access_token=${MAPBOX_TOKEN}`,
        { method: 'GET' }
      );
      const json = await query.json();
      if (json.code !== 'Ok') {
        console.error('Mapbox Directions API error:', json.message);
        toast({
          title: "Route Fetch Failed",
          description: json.message || "Could not fetch route from Mapbox.",
          variant: "destructive"
        });
        return;
      }

      const fetchedRoutes = {
        Low: json.routes[0],
        Medium: json.routes[1] || json.routes[0],
        High: json.routes[2] || json.routes[1] || json.routes[0]
      };

      setRoutes(fetchedRoutes);
    } catch (error) {
      console.error('Failed to fetch routes:', error);
    }
  }, [toast]);

  // 3. Update routes when destination changes
  useEffect(() => {
    if (currentLocation && destination) {
      fetchRoutes(currentLocation, destination);
    } else {
      setRoutes(null);
    }
  }, [currentLocation, destination, fetchRoutes]);

  // Handle map click
  const onMapClick = useCallback((e) => {
    if (!hasAnalysis) {
      toast({
        title: "Action Disabled",
        description: "Please analyze an audio clip first before selecting a route.",
        variant: "destructive"
      });
      return;
    }

    const newDest = [e.latlng.lat, e.latlng.lng];
    setDestination(newDest);
  }, [hasAnalysis, toast]);

  // Convert GeoJSON coordinates [lng, lat] to Leaflet [lat, lng]
  const getRoutePath = () => {
    if (!routes || !routes[noiseLevel]) return [];
    const coords = routes[noiseLevel].geometry.coordinates;
    return coords.map(([lng, lat]) => [lat, lng]);
  };

  const routePath = getRoutePath();

  if (!currentLocation) {
    return (
      <div className="bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 rounded-lg animate-pulse">
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-gray-500 font-medium">Locating you on the map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 rounded-lg transition-all">
      <div className="pb-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-t-lg px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-lg font-semibold">
          <RouteIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Dynamic Noise-Aware Route Map
        </h3>
        {currentLocation && !destination && (
          <span className="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 animate-pulse bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1.5 rounded-full">
            <Navigation className="w-4 h-4" /> Tap anywhere on the map to set a destination
          </span>
        )}
      </div>

      <div className="p-4 sm:p-6 space-y-4 bg-gray-50/30 dark:bg-slate-800 rounded-b-lg relative">
        <div style={{ width: "100%", height: "calc(100vh - 200px)", borderRadius: "12px", overflow: "hidden" }}>
          <MapContainer
            center={currentLocation}
            zoom={14}
            style={{ width: "100%", height: "100%" }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapClickHandler onClick={onMapClick} />

            {/* User's Current Location */}
            <Marker position={currentLocation} icon={youIcon}>
              <Popup>Your current location</Popup>
            </Marker>

            {/* Destination */}
            {destination && (
              <Marker position={destination} icon={destIcon}>
                <Popup>Destination</Popup>
              </Marker>
            )}

            {/* Route Polyline */}
            {routePath.length > 0 && (
              <Polyline
                positions={routePath}
                pathOptions={{
                  color: ROUTE_COLOR[noiseLevel] || ROUTE_COLOR.Low,
                  weight: 6,
                  opacity: 0.8,
                }}
              />
            )}
          </MapContainer>
        </div>

        {/* Status Indicator */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-100 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            {!hasAnalysis ? (
              <>
                <Badge variant="outline" className="text-sm px-3 py-1 whitespace-nowrap text-gray-500 border-gray-300 dark:border-gray-600">
                  Pending
                </Badge>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Upload audio to enable routing
                </p>
              </>
            ) : (
              <>
                <Badge variant={levelVariants[noiseLevel]} className="text-sm px-3 py-1 whitespace-nowrap">
                  {noiseLevel} Noise
                </Badge>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {levelMessages[noiseLevel]}
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
            {destination && (
              <button
                onClick={() => { setDestination(null); setRoutes(null); }}
                className="text-xs font-semibold px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 rounded-md text-gray-800 dark:text-gray-100 transition-colors shadow-sm"
              >
                Clear Route
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoiseRouteMap;
