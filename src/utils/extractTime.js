export function extractTime(dateString) {
    const date = new Date(dateString);
    let hours = date.getHours(); // Get hours in 24-hour format
    const minutes = padZero(date.getMinutes());

    const ampm = hours >= 12 ? 'PM' : 'AM'; // Determine AM/PM

    // Convert to 12-hour format
    hours = hours % 12; // Modulo 12 to get 0-11
    hours = hours ? hours : 12; // If hours is 0 (midnight), make it 12

    return `${hours}:${minutes} ${ampm}`;
}

// Helper function to pad single-digit numbers with a leading zero
function padZero(number) {
    return number.toString().padStart(2, "0");
}
