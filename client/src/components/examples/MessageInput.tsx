import MessageInput from "../MessageInput";

export default function MessageInputExample() {
  return (
    <div className="bg-background">
      <MessageInput
        onSendMessage={(msg) => console.log("Send message:", msg)}
        onAttachFile={() => console.log("Attach file clicked")}
        onToggleEmoji={() => console.log("Toggle emoji clicked")}
      />
    </div>
  );
}
