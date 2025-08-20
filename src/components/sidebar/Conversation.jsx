import { useEffect, useState } from "react";
import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversation";

const Conversation = ({ conversation, lastIdx, emoji }) => {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const { getUserPresence, ably } = useSocketContext();

  const [isOnline, setIsOnline] = useState(false);
  const isSelected = selectedConversation?._id === conversation._id;

  useEffect(() => {
    if (!ably) return;

    const userId = conversation._id;
    const userChannel = ably.channels.get(`chat:${userId}`);

    const checkPresence = async () => {
      const online = await getUserPresence(userId);
      setIsOnline(online);
    };

    checkPresence();

    const onEnter = () => setIsOnline(true);
    const onLeave = async () => {
      const online = await getUserPresence(userId);
      setIsOnline(online);
    };

    userChannel.presence.subscribe("enter", onEnter);
    userChannel.presence.subscribe("leave", onLeave);

    return () => {
      userChannel.presence.unsubscribe("enter", onEnter);
      userChannel.presence.unsubscribe("leave", onLeave);
    };
  }, [ably, conversation._id, getUserPresence]);

  return (
    <>
      <div
        className={`flex gap-2 items-center hover:bg-teal-700 rounded p-2 py-1 cursor-pointer
        ${isSelected ? "bg-teal-600" : ""}
      `}
        onClick={() => setSelectedConversation(conversation)}
      >
        <div className={`avatar ${isOnline ? "online" : ""}`}>
          <div className="w-12 rounded-full">
            <img src={conversation.profilePic} alt="user avatar" />
          </div>
        </div>

        <div className="flex flex-col flex-1">
          <div className="flex gap-3 justify-between">
            <p className="font-bold text-gray-100">{conversation.fullName}</p>
            <span className="text-xl">{emoji}</span>
          </div>
        </div>
      </div>

      {!lastIdx && <div className="divider my-0 py-0 h-1 text-gray-700" />}
    </>
  );
};

export default Conversation;