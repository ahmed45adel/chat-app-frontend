import { createContext, useState, useEffect, useContext } from "react";
import { Realtime } from "ably";
import { useAuthContext } from "./AuthContext";

const SocketContext = createContext();
export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({ children }) => {
  const [ably, setAbly] = useState(null);
  const [channel, setChannel] = useState(null);
  const { authUser } = useAuthContext();

  useEffect(() => {
    if (!authUser) {
      // If no user is authenticated, ensure Ably client and channel are null
      if (ably) ably.close(); // Close any existing client if user logs out
      setAbly(null);
      setChannel(null);
      return;
    }

    const userId = authUser.data._id;
    const ablyURL = `${import.meta.env.VITE_API_URL}/api/createTokenRequest?userId=${userId}`;

    const client = new Realtime({ authUrl: ablyURL });

    const personalChannel = client.channels.get(`chat:${userId}`);

    // Ably's Realtime client handles connection state,
    // ensure presence is entered only when connected.
    client.connection.on('connected', async () => {
      try {
        await personalChannel.presence.enter({ online: true });
      } catch (err) {
        console.error("Failed to enter presence:", err);
      }
    });

    setAbly(client);
    setChannel(personalChannel);

    return () => {
 
      if (client) {
        client.close();
      }
      setAbly(null);
      setChannel(null);
    };
  }, [authUser]);

  /**
   * Helper: check if a user is online by looking at their presence set
   */
  const getUserPresence = async (userId) => {
    if (!ably) {
      return false;
    }
    try {
      const userChannel = ably.channels.get(`chat:${userId}`);
      const members = await userChannel.presence.get();
      return members.length > 0;
    } catch (err) {
      console.error("Presence lookup failed:", err);
      return false;
    }
  };

  return (
    <SocketContext.Provider value={{ ably, channel, getUserPresence }}>
      {children}
    </SocketContext.Provider>
  );
};