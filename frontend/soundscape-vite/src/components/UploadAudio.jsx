import React, { useState } from "react";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "../hooks/use-toast";
import { Loader2, Headphones } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function UploadAudio({ setResult, setCNNData, fileInputKey, currentFileName }) {
  const [mode, setMode] = useState("ml");
  const [isUploading, setIsUploading] = useState(false);
  const [localFileName, setLocalFileName] = useState("");
  const { toast } = useToast();

  React.useEffect(() => {
    setLocalFileName("");
  }, [fileInputKey]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLocalFileName(file.name);

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select an audio file (.wav, .mp3, .m4a, etc.)",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Please select an audio file smaller than 10MB.",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      let url =
        mode === "cnn"
          ? "http://127.0.0.1:8000/predict_cnn"
          : mode === "hybrid"
          ? "http://127.0.0.1:8000/predict_hybrid"
          : "http://127.0.0.1:8000/predict";

      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      data.fileName = file.name;

      if (mode === "cnn") {
        setCNNData(data);
        setResult(data);
      } else {
        setResult(data);
        setCNNData(null);
      }

      toast({
        title: "Analysis Complete",
        description: `Audio processed successfully using ${mode.toUpperCase()} model.`,
      });

    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Unable to process the audio file. Please check if the backend is running and try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 rounded-lg">
      <div className="pb-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-t-lg px-6 py-4 border-b border-gray-100 dark:border-slate-700">
        <h3 className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-lg font-semibold">
          <Headphones className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Audio Upload & Analysis
        </h3>
      </div>
      <div className="p-6 space-y-4 bg-gray-50/50 dark:bg-slate-800 rounded-b-lg">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Select Model Type</label>
          <Select value={mode} onValueChange={setMode} disabled={isUploading}>
            <SelectTrigger className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600">
              <SelectValue placeholder="Choose analysis model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ml">ML Model</SelectItem>
              <SelectItem value="cnn">CNN Model</SelectItem>
              <SelectItem value="hybrid">Hybrid (ML + CNN)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Upload Audio File</label>
          <div className="relative">
            <div className={`flex items-center w-full min-h-[40px] border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 overflow-hidden transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <label className={`cursor-pointer h-full min-h-[40px] flex items-center justify-center px-4 border-r border-gray-300 dark:border-slate-600 bg-emerald-50 dark:bg-emerald-900/30 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition-colors shrink-0 ${isUploading ? 'pointer-events-none' : ''}`}>
                Choose File
                <input 
                  key={fileInputKey}
                  type="file" 
                  accept="audio/*" 
                  onChange={handleUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
              <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 truncate w-full">
                {localFileName || currentFileName || "No file chosen"}
              </span>
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-white/90 dark:bg-slate-800/80 flex items-center justify-center rounded-md">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing audio...
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Supported formats: WAV, MP3, M4A, etc. Max size: 10MB
          </p>
        </div>
      </div>
    </div>
  );
}

export default UploadAudio;
