import React from "react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { ChevronLeft, ChevronRight, LogOut, Headphones, Map, BarChart3, TrendingUp, History, Volume2 } from "lucide-react";

function Sidebar({ activeSection, setActiveSection, isCollapsed, setIsCollapsed, onLogout }) {
  const menuItems = [
    { id: "upload", icon: Headphones, label: "Upload Audio" },
    { id: "route", icon: Map, label: "Noise Route Map" },
    { id: "stats", icon: TrendingUp, label: "Statistics" },
    { id: "accuracy", icon: BarChart3, label: "Model Accuracy" },
    { id: "history", icon: History, label: "History" },
  ];

  return (
    <div className={cn(
      "fixed left-0 top-0 h-screen bg-gradient-to-b from-emerald-600 to-teal-700 dark:from-slate-800 dark:to-slate-900 text-white shadow-xl transition-all duration-300 z-50 flex flex-col",
      isCollapsed ? "w-16" : "w-16 md:w-64"
    )}>
      <div className={cn(
        "p-4 border-b border-white/20 dark:border-white/10 flex items-center",
        isCollapsed ? "justify-center" : "justify-center md:justify-between"
      )}>
        {!isCollapsed && (
          <div className="text-lg font-semibold hidden md:flex items-center gap-2 text-white">
            <Volume2 className="w-5 h-5" />
            <span>Menu</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white hover:bg-white/10 dark:hover:bg-white/5 border-none"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start text-white hover:bg-white/10 dark:hover:bg-white/5 transition-colors duration-200",
              isCollapsed && "justify-center px-2",
              "md:justify-start",
              !isCollapsed && "md:justify-start",
              activeSection === item.id && "bg-white/20 dark:bg-white/10 text-white font-medium shadow-sm"
            )}
            onClick={() => setActiveSection(item.id)}
            title={item.label}
          >
            <item.icon className="w-5 h-5" />
            {!isCollapsed && <span className="ml-3 hidden md:inline">{item.label}</span>}
          </Button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-white/20 dark:border-white/10">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-white hover:bg-orange-500/20 hover:text-orange-100 transition-colors duration-200",
            isCollapsed && "justify-center px-2",
            "md:justify-start",
            !isCollapsed && "md:justify-start"
          )}
          onClick={onLogout}
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-3 hidden md:inline">Logout</span>}
        </Button>
      </div>
    </div>
  );
}

export default Sidebar;
