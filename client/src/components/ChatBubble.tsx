import { useState } from "react";
import { Check, CheckCheck, X, Download, FileText, Video as VideoIcon } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ChatBubbleProps {
  message?: string;
  timestamp: Date;
  isOwn: boolean;
  isRead?: boolean;
  imageUrl?: string;
  fileName?: string;
  fileSize?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'file';
}

export default function ChatBubble({
  message,
  timestamp,
  isOwn,
  isRead = false,
  imageUrl,
  fileName,
  fileSize,
  mediaUrl,
  mediaType,
}: ChatBubbleProps) {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isPdfOpen, setIsPdfOpen] = useState(false);

  const getAbsoluteUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${window.location.origin}${url.startsWith('/') ? url : '/' + url}`;
  };

  const handleDownload = () => {
    const url = mediaUrl || imageUrl;
    if (!url) return;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'download';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isPdf = fileName?.toLowerCase().endsWith('.pdf') || mediaType === 'file' && fileName?.toLowerCase().includes('.pdf');
  const absoluteMediaUrl = getAbsoluteUrl(mediaUrl);

  return (
    <>
      <div
        className={`flex ${isOwn ? "justify-end animate-slide-in-right" : "justify-start animate-slide-in-left"} mb-2`}
        data-testid={`chat-bubble-${isOwn ? "own" : "other"}`}
      >
        <div
          className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[60%] ${
            isOwn
              ? "bg-[#0E4C92] rounded-[16px_16px_4px_16px]"
              : "bg-card rounded-[16px_16px_16px_4px]"
          } px-3 sm:px-4 py-2 sm:py-3 shadow-sm`}
          style={isOwn ? { boxShadow: "0 2px 8px rgba(0, 191, 255, 0.1)" } : {}}
        >
          {mediaType === 'image' && mediaUrl && (
            <div className="mb-2 relative group">
              <img
                src={mediaUrl}
                alt="Shared media"
                className="rounded-lg max-w-full sm:max-w-[280px] md:max-w-[320px] w-full cursor-pointer hover:opacity-90 transition-opacity"
                data-testid="bubble-image"
                onClick={() => setIsImageOpen(true)}
              />
              <Button
                size="sm"
                variant="secondary"
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs sm:text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Download
              </Button>
            </div>
          )}

          {imageUrl && !mediaType && (
            <div className="mb-2 relative group">
              <img
                src={imageUrl}
                alt="Shared media"
                className="rounded-lg max-w-full sm:max-w-[280px] md:max-w-[320px] w-full cursor-pointer hover:opacity-90 transition-opacity"
                data-testid="bubble-image"
                onClick={() => setIsImageOpen(true)}
              />
              <Button
                size="sm"
                variant="secondary"
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs sm:text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Download
              </Button>
            </div>
          )}

          {mediaType === 'video' && mediaUrl && (
            <div className="mb-2 relative group">
              <video
                src={mediaUrl}
                controls
                className="rounded-lg max-w-full sm:max-w-[280px] md:max-w-[320px] w-full"
                data-testid="bubble-video"
              />
              <Button
                size="sm"
                variant="secondary"
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs sm:text-sm"
                onClick={handleDownload}
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Download
              </Button>
            </div>
          )}
        
        {fileName && mediaType === 'file' && (
          <div className="mb-2" data-testid="bubble-file">
            <div className="flex items-center gap-2 p-3 bg-background/20 rounded-lg cursor-pointer hover:bg-background/30 transition-colors"
                 onClick={isPdf ? () => setIsPdfOpen(true) : handleDownload}>
              <div className="w-10 h-10 bg-primary/20 rounded flex items-center justify-center">
                {isPdf ? (
                  <FileText className="w-5 h-5 text-primary" />
                ) : (
                  <span className="text-xs font-semibold text-primary">📄</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{fileName}</p>
                <p className="text-xs text-muted-foreground">{fileSize}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {fileName && !mediaType && (
          <div className="mb-2" data-testid="bubble-file">
            <div className="flex items-center gap-2 p-3 bg-background/20 rounded-lg cursor-pointer hover:bg-background/30 transition-colors"
                 onClick={isPdf ? () => setIsPdfOpen(true) : handleDownload}>
              <div className="w-10 h-10 bg-primary/20 rounded flex items-center justify-center">
                {isPdf ? (
                  <FileText className="w-5 h-5 text-primary" />
                ) : (
                  <span className="text-xs font-semibold text-primary">📄</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{fileName}</p>
                <p className="text-xs text-muted-foreground">{fileSize}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
        
        {message && (
          <p className="text-[15px] text-foreground leading-relaxed break-words" data-testid="bubble-message">
            {message}
          </p>
        )}
        
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
          <span className="text-[11px] text-muted-foreground" data-testid="bubble-timestamp">
            {format(timestamp, "HH:mm")}
          </span>
          {isOwn && (
            <span className="text-primary" data-testid="bubble-read-receipt">
              {isRead ? (
                <CheckCheck className="w-[14px] h-[14px]" />
              ) : (
                <Check className="w-[14px] h-[14px]" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>

      <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-black/95 border-0">
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
              onClick={() => setIsImageOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-16 text-white hover:bg-white/20 z-10"
              onClick={handleDownload}
              title="Download"
            >
              <Download className="w-6 h-6" />
            </Button>
            <img
              src={mediaUrl || imageUrl}
              alt="Full size media"
              className="max-w-full max-h-[95vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPdfOpen} onOpenChange={setIsPdfOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] max-h-[95vh] p-0 overflow-hidden">
          <div className="relative w-full h-full flex flex-col">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-background">
              <h3 className="font-semibold truncate text-sm sm:text-base pr-2">{fileName}</h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownload}
                  className="text-xs sm:text-sm"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsPdfOpen(false)}
                  className="h-8 w-8"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden" style={{ height: 'calc(95vh - 60px)' }}>
              <iframe
                src={absoluteMediaUrl}
                className="w-full h-full border-0"
                title={fileName}
                style={{ minHeight: '600px', height: '100%' }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
