import axios from 'axios';
import { BASE_URL } from './auth';

export const revenueService = {
  // Lấy danh sách homestay với booking details
  getMyHomestays: async () => {
    try {
      const response = await axios.get(`${BASE_URL.replace('/api', '')}/odata/Homestays/MyHomestays()?$expand=Bookings($expand=BookingDetails)`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching homestays:', error);
      throw error;
    }
  },

}