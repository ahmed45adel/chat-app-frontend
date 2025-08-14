import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import apiClient from "../utils/apiClient";

const useGetConversations = () => {
	const [loading, setLoading] = useState(false);
	const [conversations, setConversations] = useState([]);
	const { authUser } = useAuthContext();

	useEffect(() => {
		const getConversations = async () => {
			setLoading(true);
			try {
				const res = await apiClient.get("/api/users");
				const data = await res?.json();
				if (data.error) {
					throw new Error(data.error);
				}
				setConversations(data);
			} catch (error) {
				toast.error(error.message);
			} finally {
				setLoading(false);
			}
		};

		if (authUser) getConversations();
	}, [authUser]);

	return { loading, conversations };
};
export default useGetConversations;
