import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";
import notificationSound from "../assets/sounds/notification.mp3";

const useListenMessages = () => {
  const { channel } = useSocketContext();
  const { selectedConversation, setMessages, appendMessage } = useConversation();

  useEffect(() => {
    if (!channel) return;

    const handleNewMessage = (message) => {
      const newMessage = { ...message.data, shouldShake: true };

      // Play notification only if message belongs to the currently open conversation
      if (
        selectedConversation &&
        (newMessage.senderId === selectedConversation._id ||
         newMessage.receiverId === selectedConversation._id)
      ) {
        appendMessage(newMessage);

        const sound = new Audio(notificationSound);
        sound.play();
      }
    };

    channel.subscribe("newMessage", handleNewMessage);

    return () => {
      channel.unsubscribe("newMessage", handleNewMessage);
    };
  }, [channel, selectedConversation?._id, setMessages]); 
};

export default useListenMessages;