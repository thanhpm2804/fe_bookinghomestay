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
export const createHomestay = async (homestayData) => {
    try {
        const url = `${API_BASE_URL}create`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                //'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(homestayData)
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
