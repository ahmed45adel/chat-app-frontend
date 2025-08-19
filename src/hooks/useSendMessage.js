import { useState } from "react";
import toast from "react-hot-toast";
import useConversation from "../zustand/useConversation";
import apiClient from "../utils/apiClient";

const useSendMessage = () => {
	const [loading, setLoading] = useState(false);
	const { appendMessage, selectedConversation } = useConversation();

	const sendMessage = async (message) => {
		setLoading(true);
		try {
			const { data } = await apiClient.post(`/api/messages/send/${selectedConversation._id}`, { message });
			if (data.error) throw new Error(data.error);

			appendMessage(data);
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { sendMessage, loading };
};
export default useSendMessage;
