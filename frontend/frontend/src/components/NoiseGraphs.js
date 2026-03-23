import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Pie } from "react-chartjs-2";
import { TrendingUp } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { formatNoiseType } from "../utils/formatNoiseType";

// REGISTER REQUIRED COMPONENTS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

function NoiseGraphs({ stats }) {
  const { isDark } = useTheme();
  
  if (!stats) return null;

  const levelLabels = stats.levels.map(i => i._id);
  const levelCounts = stats.levels.map(i => i.count);

  // Create proper color mapping for noise levels
  const getLevelColor = (level) => {
    switch(level.toLowerCase()) {
      case 'high': return '#ef4444'; // Red
      case 'medium': return '#f59e0b'; // Yellow
      case 'low': return '#10b981'; // Green
      default: return '#6b7280'; // Gray fallback
    }
  };
  
  const levelColors = levelLabels.map(label => getLevelColor(label));

  const typeLabels = stats.types.map(i => formatNoiseType(i._id));
  const typeCounts = stats.types.map(i => i.count);

  // Theme-aware colors
  const textColor = isDark ? '#ffffff' : '#374151';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  return (
    <div className="w-full bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 rounded-lg">
      <div className="pb-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-t-lg px-6 py-4 border-b border-gray-100 dark:border-slate-700">
        <h3 className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-lg font-semibold">
          <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Noise Statistics
        </h3>
      </div>
      <div className="p-6 bg-gray-50/30 dark:bg-slate-800 rounded-b-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-700/50 p-4 rounded-lg border border-gray-200 dark:border-slate-600">
            <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Noise Level Distribution</h4>
            <div className="w-full h-80">
              <Bar
                data={{
                  labels: levelLabels,
                  datasets: [
                    {
                      label: "Count",
                      data: levelCounts,
                      backgroundColor: levelColors,
                      borderRadius: 6,
                      borderWidth: 0,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                      titleColor: 'white',
                      bodyColor: 'white',
                      borderColor: isDark ? '#64748b' : 'rgba(255, 255, 255, 0.1)',
                      borderWidth: 1,
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        font: {
                          size: 14,
                          weight: 'bold',
                        },
                        color: textColor,
                      },
                    },
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: gridColor,
                      },
                      ticks: {
                        font: {
                          size: 12,
                        },
                        color: textColor,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-700/50 p-4 rounded-lg border border-gray-200 dark:border-slate-600">
            <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Noise Type Distribution</h4>
            <div className="w-full h-80 flex justify-center">
              <div className="w-80 h-80">
                <Pie
                  data={{
                    labels: typeLabels,
                    datasets: [
                      {
                        data: typeCounts,
                        backgroundColor: [
                          "#10b981",  // Emerald
                          "#f59e0b",  // Amber
                          "#ef4444",  // Red
                          "#06b6d4",  // Cyan
                          "#8b5cf6",  // Violet
                          "#14b8a6",  // Teal
                          "#84cc16",  // Lime
                          "#f97316",  // Orange
                        ],
                        borderWidth: 2,
                        borderColor: isDark ? "#1e293b" : "#ffffff",
                        hoverBorderWidth: 3,
                        hoverBorderColor: isDark ? "#1e293b" : "#ffffff",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 15,
                          usePointStyle: true,
                          pointStyle: 'circle',
                          font: {
                            size: 12,
                            weight: '500',
                          },
                          color: textColor,
                        },
                      },
                      tooltip: {
                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: isDark ? '#64748b' : 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        callbacks: {
                          label: function(context) {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${value} (${percentage}%)`;
                          }
                        }
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoiseGraphs;