import Conversations from "./Conversations";
import LogoutButton from "./LogoutButton";
import SearchInput from "./SearchInput";

const Sidebar = () => {
	return (
		<div className='border-r border-gray-700 p-4 flex flex-col'>
			<SearchInput />
			<div className='divider px-3 text-gray-700'></div> {/* The 'divider' class often creates a line, this sets its color */}
			<Conversations />
			<LogoutButton />
		</div>
	);
};
export default Sidebar;