import { API_BASE_URL } from "../configs/apiConfig";

export const getRoomByHomestayId = async (homestayId, checkIn, checkOut) => {

    try {
         let url = `${API_BASE_URL}api/rooms/get-rooms-by-homestayId/${homestayId}`;
        if (checkIn && checkOut) {
            const params = new URLSearchParams({ checkIn, checkOut });
            url += `?${params.toString()}`;
        }
        const response = await fetch(url);

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