import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ClientListItemProps {
  id: string;
  name: string;
  avatarUrl?: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount?: number;
  isActive?: boolean;
  online?: boolean;
  onClick: () => void;
}

export default function ClientListItem({
  name,
  avatarUrl,
  lastMessage,
  timestamp,
  unreadCount = 0,
  isActive = false,
  online = false,
  onClick,
}: ClientListItemProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-4 cursor-pointer hover-elevate active-elevate-2 border-l-4 ${
        isActive ? "bg-sidebar-accent border-l-primary" : "border-l-transparent"
      } transition-colors`}
      data-testid={`client-item-${name.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="relative">
        <Avatar className="w-12 h-12 shrink-0" data-testid="client-avatar">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback className="bg-card text-card-foreground">{initials}</AvatarFallback>
        </Avatar>
        {online && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-sidebar" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium text-sm truncate" data-testid="client-name">
            {name}
          </h3>
          <span className="text-xs text-muted-foreground shrink-0 ml-2" data-testid="client-timestamp">
            {format(timestamp, "HH:mm")}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground truncate" data-testid="client-last-message">
            {lastMessage}
          </p>
          {unreadCount > 0 && (
            <Badge
              variant="default"
              className="shrink-0 h-5 min-w-5 px-1.5 text-xs"
              data-testid="client-unread-badge"
            >
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
