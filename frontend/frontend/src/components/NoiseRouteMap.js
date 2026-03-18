import { GoogleMap, Polyline, useJsApiLoader } from "@react-google-maps/api";
import { Badge } from "./ui/badge";
import { Route, Map } from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "calc(100vh - 200px)",
  borderRadius: "12px",
};

const libraries = [];

// Mysuru base points
const START = { lat: 12.2958, lng: 76.6394 }; // KSRTC
const DESTINATION = { lat: 12.3040, lng: 76.6500 }; // Hospital area

// Routes
const ROUTES = {
  Low: [
    START,
    { lat: 12.298, lng: 76.642 },
    DESTINATION,
  ],
  Medium: [
    START,
    { lat: 12.292, lng: 76.630 }, // slight detour
    { lat: 12.300, lng: 76.645 },
    DESTINATION,
  ],
  High: [
    START,
    { lat: 12.285, lng: 76.620 }, // quiet residential
    { lat: 12.295, lng: 76.655 },
    DESTINATION,
  ],
};

// Route colors
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
  Low: "Normal route – safe noise level",
  Medium: "Moderate noise – quieter detour suggested", 
  High: "High noise – avoiding noisy zones"
};

function NoiseRouteMap({ noiseLevel = "Low" }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY,
    libraries,
  });

  if (!isLoaded) {
    return (
      <div className="bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 rounded-lg">
        <div className="pb-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-t-lg px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <h3 className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-lg font-semibold">
            <Route className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Noise-Aware Route (Mysuru)
          </h3>
        </div>
        <div className="p-6 bg-gray-50/30 dark:bg-slate-800 rounded-b-lg">
          <p className="text-center text-gray-600 dark:text-muted-foreground flex items-center justify-center gap-2">
            <Map className="w-4 h-4" /> Loading Mysuru routes…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 rounded-lg">
      <div className="pb-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-t-lg px-6 py-4 border-b border-gray-100 dark:border-slate-700">
        <h3 className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-lg font-semibold">
          <Route className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Noise-Aware Route (Mysuru)
        </h3>
      </div>
      <div className="p-6 space-y-4 bg-gray-50/30 dark:bg-slate-800 rounded-b-lg">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={START}
          zoom={13}
        >
          {/* Route */}
          <Polyline
            path={ROUTES[noiseLevel] || ROUTES.Low}
            options={{
              strokeColor: ROUTE_COLOR[noiseLevel],
              strokeOpacity: 0.9,
              strokeWeight: 6,
            }}
          />
        </GoogleMap>

        <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
          <Badge variant={levelVariants[noiseLevel]}>
            {noiseLevel} Noise Level
          </Badge>
          <p className="text-sm text-gray-600 dark:text-muted-foreground">
            {levelMessages[noiseLevel]}
          </p>
        </div>
      </div>
    </div>
  );
}

export default NoiseRouteMap;
