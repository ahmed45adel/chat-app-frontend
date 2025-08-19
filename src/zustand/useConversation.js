import { create } from "zustand";

const useConversation = create((set) => ({
  selectedConversation: null,

  setSelectedConversation: (selectedConversation) =>
    set({ selectedConversation }),

  // always starts as an array
  messages: [],

  // replace all messages safely
  setMessages: (msgs) => {
    let safeMessages = [];

    if (Array.isArray(msgs)) {
      safeMessages = msgs.filter(
        (m) => m && typeof m === "object" && !Array.isArray(m)
      );
    } else if (msgs && typeof msgs === "object" && !Array.isArray(msgs)) {
      safeMessages = [msgs];
    }

    set({ messages: safeMessages });
  },

  // append one message safely, prevent duplicates
  appendMessage: (msg) =>
    set((state) => {
      if (!msg || typeof msg !== "object") return state;

      // fallback id for optimistic messages with no _id yet
      const id = msg._id || crypto.randomUUID();

      // skip if already exists
      const exists = state.messages.some((m) => m._id === id);
      if (exists) return state;

      return {
        messages: [...state.messages, { ...msg, _id: id }],
      };
    }),

  // reset messages (e.g. on convo switch)
  clearMessages: () => set({ messages: [] }),
}));

export default useConversation;