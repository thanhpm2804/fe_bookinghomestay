import { API_BASE_URL } from "../configs/apiConfig";
export const getWards = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}api/Wards`);
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
export const getHomestayAmenities = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}odata/Amenity?$filter=Type eq 'Homestay'`);
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
export const getNeighbourhoods = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}odata/Neighbourhood`);
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
export const getPolicies = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}odata/Policy`);
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
export const getBedRooms = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}odata/BedType`);
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