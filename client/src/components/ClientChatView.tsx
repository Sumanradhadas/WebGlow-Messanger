import { useState, useEffect, useRef } from "react";
import { ArrowLeft, MoreVertical, Phone, Video, Paperclip, LogOut, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import ChatBubble from "./ChatBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import NotificationToggle from "./NotificationToggle";
import {
  getOrCreateConversation,
  sendMessage,
  subscribeToMessages,
  subscribeToTypingStatus,
  setTypingStatus,
  Message as FirestoreMessage,
  Conversation,
} from "@/lib/messaging";
import { getUserProfile, signOut, getCurrentUser } from "@/lib/auth";
import { subscribeToUserStatus } from "@/lib/presence";
import { supabase } from "@/lib/supabase";

export default function ClientChatView() {
  const [messages, setMessages] = useState<FirestoreMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [assignedAdminId, setAssignedAdminId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast} = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCurrentUser().then(async (user) => {
      if (!user) return;
      
      setCurrentUserId(user.id);
      const profile = await getUserProfile(user.id);
      if (profile) {
        setUserProfile(profile);
        const convId = await getOrCreateConversation(
          user.id,
          profile.name,
          profile.email,
          profile.phone
        );
        setConversationId(convId);
      }
    });
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `id=eq.${conversationId}`,
        },
        async () => {
          const { data } = await supabase
            .from('conversations')
            .select('assigned_admin_id')
            .eq('id', conversationId)
            .single();
          
          if (data) {
            setAssignedAdminId(data.assigned_admin_id || null);
          }
        }
      )
      .subscribe();

    const unsubscribeMessages = subscribeToMessages(conversationId, setMessages);

    return () => {
      supabase.removeChannel(channel);
      unsubscribeMessages();
    };
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    const unsubscribeTyping = subscribeToTypingStatus(
      conversationId,
      currentUserId,
      (isTyping) => setIsTyping(isTyping)
    );

    return () => {
      unsubscribeTyping();
    };
  }, [conversationId, currentUserId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!conversationId || !currentUserId) return;

    try {
      await sendMessage(conversationId, currentUserId, text);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      await setTypingStatus(conversationId, currentUserId, false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTyping = async () => {
    if (!conversationId || !currentUserId) return;

    await setTypingStatus(conversationId, currentUserId, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(async () => {
      await setTypingStatus(conversationId, currentUserId, false);
    }, 3000);
  };

  const handleAttachFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*,.pdf,.doc,.docx";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setAttachedFile(file);

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    };
    input.click();
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    setFilePreview(null);
  };

  const handleSendFile = async (file: File, caption?: string) => {
    if (!conversationId || !currentUserId) return;

    setIsSending(true);
    try {
      const { uploadFile } = await import("@/lib/messaging");
      const { url, fileName, fileSize } = await uploadFile(file);

      const mediaType = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
        ? "video"
        : "file";

      await sendMessage(
        conversationId,
        currentUserId,
        caption || "",
        url,
        mediaType as any,
        fileName,
        fileSize
      );

      setAttachedFile(null);
      setFilePreview(null);

      toast({
        title: "File uploaded",
        description: "Your file has been shared successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center gap-3 p-4 border-b border-border bg-background" data-testid="chat-header">
        <Avatar className="w-10 h-10" data-testid="recipient-avatar">
          <AvatarImage src="https://webglowx.onrender.com/logo.png" alt="WebGlow" />
          <AvatarFallback className="bg-card">WG</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm truncate" data-testid="recipient-name">
            WebGlow Support
          </h2>
          <p className="text-xs text-muted-foreground">
            We reply within 24 hours • <NotificationToggle variant="inline" />
          </p>
        </div>
        
        <div className="flex gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" data-testid="button-more">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-6" data-testid="messages-container">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg.text}
            timestamp={new Date(msg.timestamp)}
            isOwn={msg.senderId === currentUserId}
            isRead={msg.isRead}
            imageUrl={msg.mediaType === "image" ? msg.mediaUrl : undefined}
            fileName={msg.mediaType === "file" || msg.mediaType === "video" ? msg.fileName : undefined}
            fileSize={msg.mediaType === "file" || msg.mediaType === "video" ? msg.fileSize : undefined}
            mediaUrl={msg.mediaUrl}
            mediaType={msg.mediaType}
          />
        ))}
        {isTyping && <TypingIndicator userName="Admin" />}
        <div ref={scrollRef} />
      </ScrollArea>

      <MessageInput
        onSendMessage={handleSendMessage}
        onSendFile={handleSendFile}
        onAttachFile={handleAttachFile}
        onRemoveFile={handleRemoveFile}
        attachedFile={attachedFile}
        filePreview={filePreview}
        isSending={isSending}
        onToggleEmoji={() => toast({ title: "Coming soon", description: "Emoji picker will be available soon!" })}
        onTyping={handleTyping}
      />
    </div>
  );
}
