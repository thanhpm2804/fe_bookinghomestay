import { API_BASE_URL } from "../configs/apiConfig";



export const getHomestayById = async (homestayId) => {
    try {
        const response = await fetch(`${API_BASE_URL}get-by-id/${homestayId}`);
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