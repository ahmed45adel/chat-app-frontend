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
				if (res.error) {
					throw new Error(res.error);
				}
				setConversations(res);
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
