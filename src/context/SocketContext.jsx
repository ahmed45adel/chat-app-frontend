import { createContext, useState, useEffect, useContext } from "react";
import { Realtime } from "ably";
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
    if (!authUser) {
      // If user logs out, cleanup client
      if (ablyClient) {
        try {
          ablyClient.close();
        } catch (err) {
          console.error("Error closing Ably client:", err);
        }
        setAblyClient(null);
      }
      setChannel(null);
      setOnlineUsers([]);
      return;
    }

    // ----------------------------
    // Setup on login
    // ----------------------------
    const userId = authUser.data._id;
    const ablyURL = `${import.meta.env.VITE_API_URL}/api/createTokenRequest`;
    const params = new URLSearchParams({ userId });
    const urlWithParams = `${ablyURL}?${params.toString()}`;

    const ably = new Realtime({ authUrl: urlWithParams });
    setAblyClient(ably);

    // Global channel (for online users list)
    const globalChannel = ably.channels.get("chat:global");
    const onlineUsersListener = (message) => {
      setOnlineUsers(message.data);
    };
    globalChannel.subscribe("getOnlineUsers", onlineUsersListener);

    // Personal channel (logged-in user receives messages)
    const personalChannel = ably.channels.get(`chat:${userId}`);
    setChannel(personalChannel);

    // Mark user online via backend
    apiClient
      .post("/api/userConnected", { userId })
      .then(() => apiClient.get("/api/onlineUsers"))
      .then((res) => setOnlineUsers(res.data.onlineUsers))
      .catch(console.error);

    // ----------------------------
    // Cleanup function
    // ----------------------------
    return () => {
      // Unsubscribe from listeners
      globalChannel.unsubscribe("getOnlineUsers", onlineUsersListener);
      if (personalChannel) {
        personalChannel.unsubscribe(); // no detach here ✅
      }

      // Close Ably client safely (auto detaches channels)
      if (ably) {
        try {
          ably.close();
        } catch (err) {
          console.error("Error closing Ably client:", err);
        }
      }

      setChannel(null);
      setAblyClient(null);

      // Mark user offline
      apiClient
        .post("/api/userDisconnected", { userId })
        .then(() => apiClient.get("/api/onlineUsers"))
        .then((res) => setOnlineUsers(res.data.onlineUsers))
        .catch(console.error);
    };
  }, [authUser]);

  return (
    <SocketContext.Provider value={{ channel, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};