import ClientChatView from "../ClientChatView";

export default function ClientChatViewExample() {
  return (
    <ClientChatView
      recipientName="WebGlow Support"
      isOnline={true}
      onBack={() => console.log("Back clicked")}
    />
  );
}
