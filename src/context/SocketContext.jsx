import { createContext, useState, useEffect, useContext } from "react";
import { Realtime } from 'ably';
import { useAuthContext } from "./AuthContext";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [channel, setChannel] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { authUser } = useAuthContext();

  useEffect(() => {
    let ablyClient;
    let channelInstance;

    if (authUser) {
      ablyClient = new Realtime({ authUrl: "/api/createTokenRequest" });
      channelInstance = ablyClient.channels.get(`users:${authUser._id}`);
      setChannel(channelInstance);

      const onOnlineUsers = (message) => {
        setOnlineUsers(message.data);
      };
      channelInstance.subscribe("getOnlineUsers", onOnlineUsers);

      // Cleanup function to be run when the component unmounts or authUser changes.
      return () => {
        if (channelInstance) {
          channelInstance.unsubscribe("getOnlineUsers", onOnlineUsers);
          channelInstance.detach();
        }
        if (ablyClient) {
          ablyClient.close();
        }
        setChannel(null);
      };
    }
  }, [authUser]);

  return <SocketContext.Provider value={{ channel, onlineUsers }}>{children}</SocketContext.Provider>;
};