import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";
import notificationSound from "../assets/sounds/notification.mp3";

const useListenMessages = () => {
  const { channel } = useSocketContext();
  const { messages, setMessages } = useConversation();

  useEffect(() => {
    const handleNewMessage = (message) => {
      const newMessage = { ...message.data, shouldShake: true };
      const sound = new Audio(notificationSound);
      sound.play();
      setMessages(prev => [...prev, newMessage]);
    };

    channel?.subscribe('newMessage', handleNewMessage);

    return () => channel?.unsubscribe('newMessage', handleNewMessage);
  }, [channel, setMessages, messages]);
};

export default useListenMessages;