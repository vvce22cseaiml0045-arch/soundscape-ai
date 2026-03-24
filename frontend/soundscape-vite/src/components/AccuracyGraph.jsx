import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { BarChart3 } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function AccuracyGraph() {
  const [data, setData] = useState(null);
  const { isDark } = useTheme();

  useEffect(() => {
    fetch("http://localhost:8000/accuracy-comparison")
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return null;

  // Theme-aware colors
  const textColor = isDark ? '#ffffff' : '#374151';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 rounded-lg">
      <div className="pb-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-t-lg px-6 py-4 border-b border-gray-100 dark:border-slate-700">
        <h3 className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-lg font-semibold">
          <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Model Accuracy Comparison
        </h3>
      </div>
      <div className="p-6 bg-gray-50/30 dark:bg-slate-800 rounded-b-lg">
        <Bar
          data={{
            labels: data.models,
            datasets: [
              {
                label: "Accuracy (%)",
                data: data.accuracies,
                backgroundColor: ["#10b981", "#06b6d4", "#8b5cf6"],
                borderRadius: 4,
              },
            ],
          }}
          options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                grid: {
                  color: gridColor,
                },
                ticks: {
                  color: textColor,
                  font: {
                    size: 12,
                    weight: 'normal',
                  },
                },
                title: {
                  display: true,
                  text: 'Accuracy (%)',
                  color: textColor,
                  font: {
                    size: 14,
                    weight: 'bold',
                  },
                },
              },
              x: {
                grid: {
                  color: gridColor,
                },
                ticks: {
                  color: textColor,
                  font: {
                    size: 12,
                    weight: 'normal',
                  },
                },
                title: {
                  display: true,
                  text: 'Model Types',
                  color: textColor,
                  font: {
                    size: 14,
                    weight: 'bold',
                  },
                },
              },
            },
            plugins: {
              legend: {
                display: true,
                labels: {
                  color: textColor,
                  font: {
                    size: 12,
                  },
                },
              },
              tooltip: {
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: isDark ? '#64748b' : 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default AccuracyGraph;
