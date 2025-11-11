import { useState } from "react";
import { Send, Smile, Paperclip, X, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onSendFile?: (file: File, caption?: string) => void;
  onAttachFile?: () => void;
  onToggleEmoji?: () => void;
  onTyping?: () => void;
  attachedFile?: File | null;
  onRemoveFile?: () => void;
  filePreview?: string | null;
  isSending?: boolean;
}

export default function MessageInput({
  onSendMessage,
  onSendFile,
  onAttachFile,
  onToggleEmoji,
  onTyping,
  attachedFile,
  onRemoveFile,
  filePreview,
  isSending = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (isSending) return;
    if (attachedFile && onSendFile) {
      onSendFile(attachedFile, message.trim() || undefined);
      setMessage("");
    } else if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (onTyping) {
      onTyping();
    }
  };

  const isImage = attachedFile?.type.startsWith("image/");
  const canSend = (message.trim() || attachedFile) && !isSending;

  return (
    <div className="border-t border-border bg-background p-4" data-testid="message-input-container">
      {isSending && (
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
          <span>Sending...</span>
        </div>
      )}
      
      {attachedFile && (
        <div className="mb-3 relative">
          <div className="bg-card border border-border rounded-lg p-3 flex items-center gap-3">
            {filePreview && isImage ? (
              <div className="relative">
                <img 
                  src={filePreview} 
                  alt="Preview" 
                  className="w-20 h-20 object-cover rounded-lg"
                />
              </div>
            ) : (
              <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                <File className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{attachedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(attachedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={onRemoveFile}
              className="shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={onToggleEmoji}
          className="shrink-0"
          data-testid="button-emoji"
        >
          <Smile className="w-5 h-5" />
        </Button>
        
        <Button
          size="icon"
          variant="ghost"
          onClick={onAttachFile}
          className="shrink-0"
          data-testid="button-attach"
        >
          <Paperclip className="w-5 h-5" />
        </Button>
        
        <Textarea
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={attachedFile ? "Add a caption (optional)..." : "Type a message..."}
          className="resize-none min-h-[48px] max-h-[120px] rounded-3xl bg-input border-border focus-visible:ring-1 focus-visible:ring-primary"
          rows={1}
          data-testid="input-message"
        />
        
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!canSend}
          className={`shrink-0 rounded-full ${canSend ? "animate-glow-pulse" : ""}`}
          data-testid="button-send"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
