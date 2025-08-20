const GenderCheckbox = ({ onCheckboxChange, selectedGender }) => {
	return (
		<div className='flex'>
			<div className='form-control'>
				<label className={`label gap-2 cursor-pointer ${selectedGender === "male" ? "bg-teal-700 text-white rounded-md px-2 py-1" : "text-gray-200"} `}>
					<span className='label-text'>Male</span>
					<input
						type='checkbox'
						className='checkbox border-gray-600 checked:bg-teal-500 checked:border-teal-500'
						checked={selectedGender === "male"}
						onChange={() => onCheckboxChange("male")}
					/>
				</label>
			</div>
			<div className='form-control'>
				<label className={`label gap-2 cursor-pointer  ${selectedGender === "female" ? "bg-teal-700 text-white rounded-md px-2 py-1" : "text-gray-200"}`}>
					<span className='label-text'>Female</span>
					<input
						type='checkbox'
						className='checkbox border-gray-600 checked:bg-teal-500 checked:border-teal-500'
						checked={selectedGender === "female"}
						onChange={() => onCheckboxChange("female")}
					/>
				</label>
			</div>
		</div>
	);
};
export default GenderCheckbox;