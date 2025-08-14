import { createContext, useState, useEffect, useContext } from "react";
import { Realtime } from 'ably';
import { useAuthContext } from "./AuthContext";

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
      const params = new URLSearchParams({
          userId: authUser.data._id,
        });
      const urlWithParams = `${ablyURL}?${params.toString()}`;
         ably = new Realtime({
        authUrl: urlWithParams
      });
      console.log(ablyURL, params, urlWithParams)
      setAblyClient(ably);

      // Channel name MUST match with backend channel
      userChannel = ably.channels.get(`chat:${authUser._id}`);
      setChannel(userChannel);

      const onlineUsersListener = (message) => {
        setOnlineUsers(message.data);
      };
      userChannel.subscribe('getOnlineUsers', onlineUsersListener);

      // Cleanup function
      return () => {
        userChannel.unsubscribe('getOnlineUsers', onlineUsersListener);
        userChannel.detach();
        ably.close();
        setChannel(null);
        setAblyClient(null);
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
