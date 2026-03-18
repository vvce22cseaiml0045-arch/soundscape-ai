import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export function Spinner({ className, ...props }) {
  return (
    <Loader2 
      className={cn("h-4 w-4 animate-spin", className)} 
      {...props} 
    />
  );
}

export function LoadingSpinner({ text = "Loading...", className }) {
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Spinner />
        <span className="text-sm">{text}</span>
      </div>
    </div>
  );
}