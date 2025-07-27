import { API_BASE_URL } from "../configs/apiConfig";
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4YjEzYzBkNC01NDMyLTQyZGYtOWI3Ni04YTE2M2QxMDRjNDIiLCJlbWFpbCI6Im1pbmhuZ3V5ZW5AZXhhbXBsZS5jb20iLCJuYW1laWQiOiI4YjEzYzBkNC01NDMyLTQyZGYtOWI3Ni04YTE2M2QxMDRjNDIiLCJ1bmlxdWVfbmFtZSI6Im1pbmhuZ3V5ZW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiQ3VzdG9tZXIiLCJuYmYiOjE3NTM1OTc3NzYsImV4cCI6MTc1MzYwODU3NiwiaWF0IjoxNzUzNTk3Nzc2LCJpc3MiOiJIb21lc3RheUFQSSIsImF1ZCI6IkhvbWVzdGF5Q2xpZW50In0._lDe2_s6CzguGKims7tQ1h-HxfC7oeXZ5DL6xvPiX_E"
export const getUserInfor = async () => {
    try {
        const url = `${API_BASE_URL}api/Account/get-user-infor/`;

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
