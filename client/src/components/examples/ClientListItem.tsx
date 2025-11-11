import ClientListItem from "../ClientListItem";
import avatar1 from "@assets/generated_images/Female_client_avatar_1_cda4b1d0.png";

export default function ClientListItemExample() {
  return (
    <div className="bg-sidebar w-[320px]">
      <ClientListItem
        id="1"
        name="Sarah Johnson"
        avatarUrl={avatar1}
        lastMessage="Thanks for the quick response!"
        timestamp={new Date()}
        unreadCount={3}
        isActive={true}
        onClick={() => console.log("Client clicked")}
      />
      <ClientListItem
        id="2"
        name="Michael Chen"
        lastMessage="I have a question about the project..."
        timestamp={new Date(Date.now() - 3600000)}
        unreadCount={0}
        isActive={false}
        onClick={() => console.log("Client clicked")}
      />
    </div>
  );
}
