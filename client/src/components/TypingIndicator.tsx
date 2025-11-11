export default function TypingIndicator({ userName = "Admin" }: { userName?: string }) {
  return (
    <div className="flex justify-start mb-2 animate-slide-in-left" data-testid="typing-indicator">
      <div className="bg-card rounded-[16px_16px_16px_4px] px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-2">{userName} is typing</span>
          <div className="flex gap-1">
            <div
              className="w-2 h-2 bg-primary rounded-full animate-typing-dot"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 bg-primary rounded-full animate-typing-dot"
              style={{ animationDelay: "200ms" }}
            />
            <div
              className="w-2 h-2 bg-primary rounded-full animate-typing-dot"
              style={{ animationDelay: "400ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
