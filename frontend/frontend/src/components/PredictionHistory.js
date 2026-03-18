import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  History, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  X, 
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Volume2
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { formatNoiseType } from "../utils/formatNoiseType";

// Alert icon component for noise levels
const NoiseAlert = ({ level }) => {
  switch (level?.toLowerCase()) {
    case "low":
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "medium":
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case "high":
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-400" />;
  }
};

function PredictionHistory({ history = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedFilter, setSelectedFilter] = useState("all");
  
  // Filter history based on selected noise level
  const filteredHistory = useMemo(() => {
    if (selectedFilter === "all") {
      return history;
    }
    return history.filter(item => 
      item.noise_level?.toLowerCase() === selectedFilter.toLowerCase()
    );
  }, [history, selectedFilter]);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredHistory.slice(startIndex, endIndex);
  
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter]);

  // Clear filter
  const clearFilter = () => {
    setSelectedFilter("all");
  };

  // Get filter counts
  const filterCounts = useMemo(() => ({
    all: history.length,
    low: history.filter(item => item.noise_level?.toLowerCase() === 'low').length,
    medium: history.filter(item => item.noise_level?.toLowerCase() === 'medium').length,
    high: history.filter(item => item.noise_level?.toLowerCase() === 'high').length,
  }), [history]);

  if (!history || history.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 rounded-lg">
        <div className="pb-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-t-lg px-6 py-4">
          <h3 className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-lg font-semibold">
            <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Prediction History
          </h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No prediction history available</p>
            <p className="text-sm">Upload and analyze audio files to see history</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 rounded-lg">
      <div className="pb-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-t-lg px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-lg font-semibold">
            <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Prediction History
            <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
              ({filteredHistory.length} {filteredHistory.length === 1 ? 'result' : 'results'})
            </span>
          </h3>
          
          {/* Filter Controls */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                    All Levels ({filterCounts.all})
                  </div>
                </SelectItem>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Low ({filterCounts.low})
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    Medium ({filterCounts.medium})
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    High ({filterCounts.high})
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            {selectedFilter !== "all" && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilter}
                className="shrink-0"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-2/5 font-semibold text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Noise Type
                  </div>
                </TableHead>
                <TableHead className="w-1/5 font-semibold text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Level
                  </div>
                </TableHead>
                <TableHead className="w-2/5 font-semibold text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date & Time
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((item, index) => (
                <TableRow 
                  key={startIndex + index}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                    {formatNoiseType(item.noise_type)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <NoiseAlert level={item.noise_level} />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {item.noise_level || 'Unknown'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {item.created_at ? new Date(item.created_at).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    }) : 'Unknown'}
                  </TableCell>
                </TableRow>
              ))}
              
              {currentItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-600 dark:text-gray-400">
                    <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No results found</p>
                    <p className="text-sm">Try adjusting your filter criteria</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredHistory.length)} of {filteredHistory.length}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  
                  if (page >= 1 && page <= totalPages) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  }
                  return null;
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PredictionHistory;
