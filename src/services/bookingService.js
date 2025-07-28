import { API_BASE_URL } from "../configs/apiConfig";
export const getUserInfor = async () => {
    try {
        const token = localStorage.getItem('token');
        const url = `${API_BASE_URL}api/Account/get-user-info/`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { error: errorData.error || `HTTP error! Status: ${response.status}` };
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.log(error);
        return { error: "An unexpected error occurred" };
    }
};
export const createBooking = async (homestayId, checkIn, checkOut, roomIds) => {
    const token = localStorage.getItem('token');
    if (!token) return { error: "Bạn chưa đăng nhập." };
    if(token == null) return { }
    try {
        const url = `${API_BASE_URL}api/Booking`;
        const bookingData = {
            homestayId: homestayId,
            dateCheckIn: checkIn,
            dateCheckOut: checkOut,
            roomIds: roomIds
        }
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { error: errorData.error || `HTTP error! Status: ${response.status}` };
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.log(error);
        return { error: "An unexpected error occurred" };
    }
};
