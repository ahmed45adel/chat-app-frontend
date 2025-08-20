import { createContext, useState, useEffect, useContext } from "react";
import { Realtime } from "ably";
import { useAuthContext } from "./AuthContext";
import apiClient from "../utils/apiClient";

const SocketContext = createContext();
export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({ children }) => {
  const [channel, setChannel] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { authUser } = useAuthContext();

  useEffect(() => {
    if (!authUser) {
      setChannel(null);
      setOnlineUsers([]);
      return;
    }

    let ably;
    let globalChannel;
    let personalChannel;

    const initialize = async () => {
      const userId = authUser.data._id;
      const ablyURL = `${import.meta.env.VITE_API_URL}/api/createTokenRequest`;
      const urlWithParams = `${ablyURL}?userId=${userId}`;

      ably = new Realtime({ authUrl: urlWithParams });

      // Global channel (online updates)
      globalChannel = ably.channels.get("chat:global");
      globalChannel.subscribe("getOnlineUsers", (message) => {
        setOnlineUsers(message.data || []);
      });

      // Personal channel
      personalChannel = ably.channels.get(`chat:${userId}`);
      setChannel(personalChannel);

      // Mark user online
      try {
        await apiClient.post("/api/userConnected", { userId });
        const res = await apiClient.get("/api/onlineUsers");
        setOnlineUsers(res.data.onlineUsers || []);
      } catch (err) {
        console.error("Error setting online:", err);
      }
    };

    initialize();

    return () => {
      if (globalChannel) {
        globalChannel.unsubscribe();
      }
      if (personalChannel) {
        personalChannel.unsubscribe();
      }
      if (ably) {
        try {
          ably.close();
        } catch (err) {
          console.error("Error closing Ably client:", err);
        }
      }

      // Mark user offline
      const userId = authUser?.data?._id;
      if (userId) {
        apiClient
          .post("/api/userDisconnected", { userId })
          .then(() => apiClient.get("/api/onlineUsers"))
          .then((res) => setOnlineUsers(res.data.onlineUsers || []))
          .catch(console.error);
      }

      setChannel(null);
    };
  }, [authUser]);

  return (
    <SocketContext.Provider value={{ channel, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};