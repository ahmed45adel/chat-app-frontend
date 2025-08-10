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
    if (authUser) {
      const ably = new Realtime.Promise({ authUrl: '/api/createTokenRequest' }); // You'll need to implement a token request endpoint
      const channel = ably.channels.get(`users:${authUser._id}`);
      setChannel(channel);

      channel.subscribe('getOnlineUsers', (message) => {
        setOnlineUsers(message.data);
      });

      return () => channel.detach();
    } else {
      if (channel) {
        channel.detach();
        setChannel(null);
      }
    }
  }, [authUser]);

  return <SocketContext.Provider value={{ channel, onlineUsers }}>{children}</SocketContext.Provider>;
};