import { createContext, useState, useEffect, useContext } from "react";
import { Realtime } from "ably";
import { useAuthContext } from "./AuthContext";
import apiClient from "../utils/apiClient";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [ablyClient, setAblyClient] = useState(null);
  const [channel, setChannel] = useState(null);        // 🔥 personal messages channel
  const [presenceChannel, setPresenceChannel] = useState(null); // 🔥 new global presence channel
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { authUser } = useAuthContext();

  useEffect(() => {
    let ably, userChannel, globalChannel;

    if (authUser) {
      const userId = authUser.data._id;
      const ablyURL = `${import.meta.env.VITE_API_URL}/api/createTokenRequest`;

      // create client
      ably = new Realtime({ authUrl: `${ablyURL}?userId=${userId}` });
      setAblyClient(ably);

      // 🔹 Global presence channel
      globalChannel = ably.channels.get("chat:global"); // for online users
      setPresenceChannel(globalChannel);

      const onlineUsersListener = (message) => {
        setOnlineUsers(message.data);
      };
      globalChannel.subscribe("getOnlineUsers", onlineUsersListener);

      // 🔹 Personal channel (for your messages)
      userChannel = ably.channels.get(`chat:${userId}`);
      setChannel(userChannel);

      // 🔹 Notify backend this user joined, then bootstrap presence list
      apiClient.post("/api/userConnected", { userId })
        .then(() => apiClient.get("/api/onlineUsers"))
        .then((res) => setOnlineUsers(res.data.onlineUsers))
        .catch(console.error);

      // cleanup
      return () => {
        globalChannel.unsubscribe("getOnlineUsers", onlineUsersListener);
        globalChannel.detach();
        userChannel.detach();
        ably.close();

        setChannel(null);
        setPresenceChannel(null);
        setAblyClient(null);
        setOnlineUsers([]);

        // notify backend disconnect
        apiClient.post("/api/userDisconnected", { userId })
          .then(() => apiClient.get("/api/onlineUsers"))
          .then((res) => setOnlineUsers(res.data.onlineUsers))
          .catch(console.error);
      };
    } else {
      if (presenceChannel) {
        presenceChannel.detach();
        setPresenceChannel(null);
      }
      if (channel) {
        channel.detach();
        setChannel(null);
      }
      if (ablyClient) {
        ablyClient.close();
        setAblyClient(null);
      }
      setOnlineUsers([]);
    }
  }, [authUser]);

  return (
    <SocketContext.Provider value={{ channel, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContextProvider;