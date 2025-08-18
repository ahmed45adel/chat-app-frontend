import { createContext, useState, useEffect, useContext } from "react";
import { Realtime } from 'ably';
import { useAuthContext } from "./AuthContext";
import apiClient from "../utils/apiClient";
const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [channel, setChannel] = useState(null);
  const [ablyClient, setAblyClient] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { authUser } = useAuthContext();
  
  
  useEffect(() => {
    let ably, userChannel;
    if (authUser) {
      const ablyURL = `${import.meta.env.VITE_API_URL}/api/createTokenRequest`;
      const userId = authUser._id;
      const params = new URLSearchParams({
          userId: userId,
        });
      const urlWithParams = `${ablyURL}?${params.toString()}`;
         ably = new Realtime({
        authUrl: urlWithParams
      });
      setAblyClient(ably);

      // Channel name MUST match with backend channel
      userChannel = ably.channels.get(`chat:${userId}`);
      setChannel(userChannel);

      const onlineUsersListener = (message) => {
        setOnlineUsers(message.data);
      };
      userChannel.subscribe('getOnlineUsers', onlineUsersListener);
      console.log(authUser)
      apiClient.post('/api/userConnected', { userId: userId });

      // Cleanup function
      return () => {
        userChannel.unsubscribe('getOnlineUsers', onlineUsersListener);
        userChannel.detach();
        ably.close();
        setChannel(null);
        setAblyClient(null);
        apiClient.post('/api/userDisconnected', { userId: userId });
      };
    } else {
      // Cleanup if user logs out
      if (channel) {
        channel.detach();
        setChannel(null);
      }
      if (ablyClient) {
        ablyClient.close();
        setAblyClient(null);
      }
    }
    // Only run effect on authUser changes
    // eslint-disable-next-line
  }, [authUser]);

  return (
    <SocketContext.Provider value={{ channel, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
