import { motion } from "framer-motion";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Search, Volume2, Target, VolumeX, BarChart3, Music, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { formatNoiseType } from "../utils/formatNoiseType";

// Function to format noise type from class name to readable text

function ResultCard({ result }) {
  if (!result) return null;

  // Noise type
  const soundType = formatNoiseType(
    result.noise_type ||
    result.prediction ||
    result.final_prediction ||
    result.cnn_result?.prediction ||
    "N/A"
  );

  // Noise level
  const level =
    result.noise_level ||
    result.ml_result?.noise_level ||
    null;

  // Confidence
  const confidence =
    result.confidence ||
    result.final_confidence ||
    result.cnn_result?.confidence ||
    null;

  // Decibel
  const decibel = result.decibel ?? null;

  // Images
  const spectrogram = result.spectrogram ?? null;
  const mfcc = result.mfcc ?? null;

  // Health message with icons
  const getHealthIcon = (level) => {
    switch (level) {
      case "Low": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Medium": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "High": return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const healthMessage =
    result.message ||
    (level === "Low"
      ? "Safe sound environment"
      : level === "Medium"
      ? "Moderate noise – prolonged exposure not advised"
      : level === "High"
      ? "High noise – avoid the area"
      : "Noise impact not estimated");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 rounded-lg">
        <div className="pb-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-t-lg px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <h3 className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-lg font-semibold">
            <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Noise Analysis Result
          </h3>
        </div>
        <div className="p-6 space-y-6 bg-gray-50/30 dark:bg-slate-800 rounded-b-lg">
          {/* Sound Type */}
          <div className="space-y-2">
            <span className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-300" /> Sound Type : <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{soundType}</span>
            </span>
           
          </div>

          {/* Noise Level */}
          {level && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Noise Level : </span>
              <Badge className="font-semibold">
                {level}
              </Badge>
            </div>
          )}

          {/* Sound Intensity */}
          {decibel !== null && (
            <div className="space-y-2">
              <span className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <VolumeX className="w-4 h-4 text-gray-600 dark:text-gray-300" /> Sound Intensity :<span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{decibel} dB</span>
              </span>
            </div>
          )}

          {/* Health Impact */}
          <div className="space-y-2">
            <span className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-200">
              {getHealthIcon(level)} Health Impact :
            </span>
            <p className="text-sm text-gray-700 dark:text-muted-foreground bg-gray-100 dark:bg-slate-700 p-3 rounded-md flex items-center gap-2 border border-gray-200 dark:border-slate-600">
              {healthMessage}
            </p>
          </div>

          {/* Confidence */}
          {confidence && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <Target className="w-4 h-4 text-gray-600 dark:text-gray-300" /> Prediction Confidence :<span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{confidence}%</span>
                </span>
              </div>
              <Progress 
                value={confidence} 
                className="h-2"
              />
            </div>
          )}

          {/* Spectrogram & MFCC */}
          {(spectrogram || mfcc) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {spectrogram && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <BarChart3 className="w-4 h-4 text-gray-600 dark:text-gray-300" /> Spectrogram
                  </h4>
                  <img
                    src={`data:image/png;base64,${spectrogram}`}
                    alt="Spectrogram"
                    className="w-full rounded-md border border-gray-200 dark:border-slate-600"
                  />
                </div>
              )}
              
              {mfcc && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <Music className="w-4 h-4 text-gray-600 dark:text-gray-300" /> MFCC
                  </h4>
                  <img
                    src={`data:image/png;base64,${mfcc}`}
                    alt="MFCC"
                    className="w-full rounded-md border border-gray-200 dark:border-slate-600"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ResultCard;
