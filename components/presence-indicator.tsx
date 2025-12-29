interface PresenceIndicatorProps {
  status: "online" | "away" | "busy" | "offline";
  size?: "sm" | "md" | "lg";
  className?: string; // allow custom classes from parent
}

export function PresenceIndicator({ status, size = "md", className = "" }: PresenceIndicatorProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3",
  };

  const statusColors = {
    online: "bg-green-500",
    away: "bg-yellow-500",
    busy: "bg-red-500",
    offline: "bg-slate-400",
  };

  return (
    <span
      className={`block rounded-full ring-2 ring-white ${sizeClasses[size]} ${statusColors[status]} ${className}`}
    />
  );
}
