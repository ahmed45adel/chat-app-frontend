import { create } from "zustand";

const useConversation = create((set) => ({
  selectedConversation: null,

  setSelectedConversation: (selectedConversation) =>
    set({ selectedConversation }),

  messages: [],

  setMessages: (msgs) =>
    set({
      messages: Array.isArray(msgs) ? msgs : msgs ? [msgs] : [], 
    }),
}));

export default useConversation;