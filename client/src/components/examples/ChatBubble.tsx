import ChatBubble from "../ChatBubble";

export default function ChatBubbleExample() {
  return (
    <div className="p-4 space-y-2 bg-background min-h-[400px]">
      <ChatBubble
        message="Hey! Just checking in. Did you get the project files I sent earlier?"
        timestamp={new Date(Date.now() - 3600000)}
        isOwn={false}
      />
      <ChatBubble
        message="Yes, I received them! Thanks for sending. I'll review and get back to you soon."
        timestamp={new Date(Date.now() - 3000000)}
        isOwn={true}
        isRead={true}
      />
      <ChatBubble
        message="Great! Let me know if you have any questions."
        timestamp={new Date(Date.now() - 1800000)}
        isOwn={false}
      />
      <ChatBubble
        message="Will do!"
        timestamp={new Date()}
        isOwn={true}
        isRead={false}
      />
    </div>
  );
}
