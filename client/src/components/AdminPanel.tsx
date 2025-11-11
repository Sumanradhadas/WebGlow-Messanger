import { useState, useEffect, useRef } from "react";
import { Search, Menu, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import ClientListItem from "./ClientListItem";
import ChatBubble from "./ChatBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import {
  subscribeToConversations,
  subscribeToMessages,
  sendMessage,
  markMessagesAsRead,
  subscribeToTypingStatus,
  setTypingStatus,
  assignAdminToConversation,
  Conversation,
  Message as FirestoreMessage,
} from "@/lib/messaging";
import { signOut, getCurrentUser } from "@/lib/auth";

const logoImage = "https://webglowx.onrender.com/logo.png";

export default function AdminPanel() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<FirestoreMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCurrentUser().then(user => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToConversations(setConversations);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    const setupConversation = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) return;

      await assignAdminToConversation(selectedConversation.id, currentUser.id);

      const unsubscribeMessages = subscribeToMessages(selectedConversation.id, setMessages);
      const unsubscribeTyping = subscribeToTypingStatus(
        selectedConversation.id,
        currentUser.id,
        (isTyping) => setIsTyping(isTyping)
      );

      markMessagesAsRead(selectedConversation.id);

      return () => {
        unsubscribeMessages();
        unsubscribeTyping();
      };
    };

    const cleanup = setupConversation();
    return () => {
      cleanup.then(fn => fn?.());
    };
  }, [selectedConversation?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const filteredConversations = conversations.filter((conv) =>
    conv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.clientEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async (text: string) => {
    if (!selectedConversation || !currentUserId) return;

    try {
      await sendMessage(selectedConversation.id, currentUserId, text);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      await setTypingStatus(selectedConversation.id, currentUserId, false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTyping = async () => {
    if (!selectedConversation || !currentUserId) return;

    await setTypingStatus(selectedConversation.id, currentUserId, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(async () => {
      await setTypingStatus(selectedConversation.id, currentUserId, false);
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
    if (!selectedConversation || !currentUserId) return;

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
        selectedConversation.id,
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
    <div className="flex h-screen bg-background">
      <div className="w-80 border-r border-border flex flex-col bg-sidebar" data-testid="client-sidebar">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="WebGlow" className="w-10 h-10" data-testid="admin-logo" />
              <div>
                <h1 className="font-semibold text-lg">WebGlow</h1>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <Menu className="w-5 h-5" />
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
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-clients"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {filteredConversations.map((conv) => (
            <ClientListItem
              key={conv.id}
              id={conv.id}
              name={conv.clientName}
              lastMessage={conv.lastMessage}
              timestamp={new Date(conv.lastMessageTimestamp)}
              unreadCount={conv.unreadCount}
              isActive={selectedConversation?.id === conv.id}
              onClick={() => setSelectedConversation(conv)}
            />
          ))}
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="flex items-center justify-between p-4 border-b border-border" data-testid="admin-chat-header">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-card">
                    {selectedConversation.clientName.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold" data-testid="selected-client-name">
                    {selectedConversation.clientName}
                  </h2>
                  <p className="text-xs text-muted-foreground" data-testid="selected-client-email">
                    {selectedConversation.clientEmail}
                    {selectedConversation.clientPhone && ` • ${selectedConversation.clientPhone}`}
                  </p>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 px-4 py-6" data-testid="admin-messages-container">
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
              {isTyping && <TypingIndicator userName={selectedConversation.clientName} />}
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a client to view conversation
          </div>
        )}
      </div>
    </div>
  );
}
