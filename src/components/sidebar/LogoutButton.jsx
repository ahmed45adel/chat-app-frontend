import { BiLogOut } from "react-icons/bi";
import useLogout from "../../hooks/useLogout";

const LogoutButton = () => {
	const { loading, logout } = useLogout();

	return (
		<div className='mt-auto'>
			{!loading ? (
				<BiLogOut className='w-6 h-6 text-gray-200 cursor-pointer hover:text-teal-400' onClick={logout} />
			) : (
				<span className='loading loading-spinner text-teal-500'></span>
			)}
		</div>
	);
};
export default LogoutButton;