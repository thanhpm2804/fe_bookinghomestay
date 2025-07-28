
import { BASE_URL } from './auth';
export const bookingListService = {
  // Fetch all bookings with expand
  async getBookings() {
    try {
      const token = localStorage.getItem("token");
  
      const response = await fetch(`${BASE_URL.replace('/api', '')}/odata/bookings?$expand=bookingDetails,Customer`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu');
      }
  
      const data = await response.json();
      return data.value || [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  // Fetch bookings with pagination
  async getBookingsWithPagination(page = 1, pageSize = 10) {
    try {
      const skip = (page - 1) * pageSize;
      const response = await fetch(
        `${BASE_URL.replace('/api', '')}/odata/bookings?$expand=bookingDetails,Customer&$skip=${skip}&$top=${pageSize}`
      );
      
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu');
      }
      
      const data = await response.json();
      return {
        bookings: data.value || [],
        totalCount: data['@odata.count'] || 0
      };
    } catch (error) {
      console.error('Error fetching bookings with pagination:', error);
      throw error;
    }
  }
};

// Booking Status constants
export const BookingStatus = {
  Pending: 0,
  Confirmed: 1,
  Cancelled: 2,
  Completed: 3
};

export const BookingStatusLabels = {
  [BookingStatus.Pending]: 'Đang chờ xác nhận',
  [BookingStatus.Confirmed]: 'Đã xác nhận',
  [BookingStatus.Cancelled]: 'Đã hủy',
  [BookingStatus.Completed]: 'Đã hoàn thành'
};

export const BookingStatusColors = {
  [BookingStatus.Pending]: 'warning',
  [BookingStatus.Confirmed]: 'success',
  [BookingStatus.Cancelled]: 'error',
  [BookingStatus.Completed]: 'info'
};

// Filter utilities
export const filterBookings = (bookings, filters) => {
  return bookings.filter(booking => {
    // Search by customer name
    if (filters.searchCustomer) {
      const customerName = `${booking.Customer?.FirstName || ''} ${booking.Customer?.LastName || ''}`.toLowerCase();
      if (!customerName.includes(filters.searchCustomer.toLowerCase())) {
        return false;
      }
    }

    // Filter by status
    if (filters.statusFilter !== 'all') {
      const statusLabel = BookingStatusLabels[parseInt(filters.statusFilter)];
      if (booking.Status !== statusLabel) {
        return false;
      }
    }

    // Filter by date range
    if (filters.dateRange) {
      const bookingDate = new Date(booking.DateBooked);
      const startDate = filters.dateRange.start;
      const endDate = filters.dateRange.end;
      
      if (startDate && bookingDate < startDate) return false;
      if (endDate && bookingDate > endDate) return false;
    }

    return true;
  });
};

// Pagination utilities
export const paginateData = (data, currentPage, pageSize) => {
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return data.slice(startIndex, endIndex);
}; 