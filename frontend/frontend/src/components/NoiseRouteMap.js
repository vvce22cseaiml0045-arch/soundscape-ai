import React, { useState, useEffect, useCallback } from "react";
import { GoogleMap, Polyline, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Badge } from "./ui/badge";
import { Route as RouteIcon, Navigation } from "lucide-react";
import { useToast } from "../hooks/use-toast";

const containerStyle = {
  width: "100%",
  height: "calc(100vh - 200px)",
  borderRadius: "12px",
};

const libraries = [];

// Fallback coordinate if Local Geolocation fails (Mysuru)
const DEFAULT_CENTER = { lat: 12.2958, lng: 76.6394 }; 

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
  Low: "Normal route – safest noise level on this direct path.",
  Medium: "Moderate noise – picked an alternative detour to avoid noise.", 
  High: "High noise – actively avoiding noisy zones by taking a wider detour."
};

// Function to generate simulated alternative routes without an API limit
const getDynamicRoutes = (start, end) => {
  if (!start || !end) return null;

  const lat1 = start.lat;
  const lng1 = start.lng;
  const lat2 = end.lat;
  const lng2 = end.lng;

  const dx = lat2 - lat1;
  const dy = lng2 - lng1;

  const midLat = (lat1 + lat2) / 2;
  const midLng = (lng1 + lng2) / 2;

  // Perpendicular vector for detour plotting
  const perpLat = -dy;
  const perpLng = dx;

  return {
    Low: [start, end], // Straight line
    Medium: [
      start,
      { lat: midLat + perpLat * 0.15, lng: midLng + perpLng * 0.15 }, // Slight curve detour
      end
    ],
    High: [
      start,
      { lat: midLat + perpLat * 0.35, lng: midLng + perpLng * 0.35 }, // Wide curve detour
      end
    ]
  };
};

function NoiseRouteMap({ noiseLevel = "Low", hasAnalysis = true }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY,
    libraries,
  });

  const [currentLocation, setCurrentLocation] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!hasAnalysis) {
      toast({
        title: "Audio Analysis Required",
        description: "Upload and analyze audio first to properly calculate noise-aware routes.",
      });
    }
  }, [hasAnalysis, toast]);
  const [destination, setDestination] = useState(null);
  const [dynamicRoutes, setDynamicRoutes] = useState(null);
  
  // 1. Get User's Present Location on Mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
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

  // 2. Generate Map Lines whenever destination is set
  useEffect(() => {
    if (currentLocation && destination) {
      setDynamicRoutes(getDynamicRoutes(currentLocation, destination));
    } else {
      setDynamicRoutes(null);
    }
  }, [currentLocation, destination]);

  // Handle click on Map to set dynamic destination
  const onMapClick = useCallback((e) => {
    if (!hasAnalysis) {
      toast({
        title: "Action Disabled",
        description: "Please analyze an audio clip first before selecting a route.",
        variant: "destructive"
      });
      return;
    }
    
    setDestination({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  }, [hasAnalysis, toast]);

  if (!isLoaded) {
    return (
      <div className="bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 rounded-lg animate-pulse">
        <div className="h-[400px] flex items-center justify-center">
            <p className="text-gray-500 font-medium">Loading Google Maps API...</p>
        </div>
      </div>
    );
  }

  // Get current active simulated route based on noise level
  const currentPath = dynamicRoutes ? (dynamicRoutes[noiseLevel] || dynamicRoutes.Low) : [];

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
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentLocation || DEFAULT_CENTER}
          zoom={14}
          onClick={onMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {/* User's Current Location */}
          {currentLocation && (
             <Marker position={currentLocation} label="You" />
          )}
          
          {/* Tapped Destination Location */}
          {destination && (
             <Marker 
               key={`dest-${destination.lat}-${destination.lng}`} 
               position={destination} 
             />
          )}

          {/* Render mathematical custom route avoiding limits */}
          {dynamicRoutes && (
            <Polyline
              key={`route-${destination.lat}-${destination.lng}`}
              path={currentPath}
              options={{
                strokeColor: ROUTE_COLOR[noiseLevel] || ROUTE_COLOR.Low,
                strokeOpacity: 0.8,
                strokeWeight: 6,
                geodesic: true,
              }}
            />
          )}
        </GoogleMap>

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
                onClick={() => setDestination(null)}
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
