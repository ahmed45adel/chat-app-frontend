import { createContext, useState, useEffect, useContext } from "react";
import { Realtime } from "ably";
import { useAuthContext } from "./AuthContext";
import apiClient from "../utils/apiClient";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [channel, setChannel] = useState(null);       // <-- per-user channel (for messages)
  const [ablyClient, setAblyClient] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { authUser } = useAuthContext();

  useEffect(() => {
    let ably, globalChannel, personalChannel;
    if (authUser) {
      const ablyURL = `${import.meta.env.VITE_API_URL}/api/createTokenRequest`;
      const userId = authUser.data._id;
      const params = new URLSearchParams({ userId });
      const urlWithParams = `${ablyURL}?${params.toString()}`;

      ably = new Realtime({ authUrl: urlWithParams });
      setAblyClient(ably);

      // ----------------------------
      // subscribe to global channel (onlineUsers)
      // ----------------------------
      globalChannel = ably.channels.get("chat:global");
      const onlineUsersListener = (message) => {
        setOnlineUsers(message.data);
      };
      globalChannel.subscribe("getOnlineUsers", onlineUsersListener);

      // ----------------------------
      // subscribe to personal channel (messages)
      // ----------------------------
      personalChannel = ably.channels.get(`chat:${userId}`);
      setChannel(personalChannel); // expose per-user channel in context

      // ----------------------------
      // Server API call: mark user online
      // ----------------------------
      apiClient
        .post("/api/userConnected", { userId })
        .then(() => apiClient.get("/api/onlineUsers"))
        .then((res) => setOnlineUsers(res.data.onlineUsers))
        .catch(console.error);

      return () => {
        //cleanup both channels
        globalChannel.unsubscribe("getOnlineUsers", onlineUsersListener);
        globalChannel.detach();

        if (personalChannel) {
          personalChannel.detach();
        }

        ably.close();
        setChannel(null);
        setAblyClient(null);

        apiClient
          .post("/api/userDisconnected", { userId })
          .then(() => apiClient.get("/api/onlineUsers"))
          .then((res) => {
            setOnlineUsers(res.data.onlineUsers); // sync on disconnect
          })
          .catch(console.error);
      };
    } else {
      //cleanup if authUser logs out
      if (channel) {
        channel.detach();
        setChannel(null);
      }
      if (ablyClient) {
        ablyClient.close();
        setAblyClient(null);
      }
    }
  }, [authUser]);

  return (
    <SocketContext.Provider value={{ channel, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};