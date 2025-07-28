
import { BASE_URL } from './auth';

export const bookingListService = {
  // Fetch all bookings with expand
  async getBookings() {
    try {
      const token = localStorage.getItem("token");
  
      const response = await fetch(`${BASE_URL.replace('/api', '')}/odata/bookings?$expand=bookingDetails($expand=Room),Customer`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu');
      }
  
      const data = await response.json();
      console.log('Bookings data:', data); // Debug log
      return data.value || [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  // Fetch bookings with pagination
  async getBookingsWithPagination(page = 1, pageSize = 10) {
    try {
      const token = localStorage.getItem("token");
      const skip = (page - 1) * pageSize;
      const response = await fetch(
        `${BASE_URL.replace('/api', '')}/odata/bookings?$expand=bookingDetails($expand=Room),Customer&$skip=${skip}&$top=${pageSize}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
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
  },

  // Update booking status
  async updateBookingStatus(bookingId, status) {
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${BASE_URL}/Booking/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(status)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cập nhật trạng thái thất bại: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }
};

// Booking Status constants - Cập nhật theo enum từ server
export const BookingStatus = {
  Pending: 0,      // Đang chờ xác nhận
  Confirmed: 1,    // Đã xác nhận
  Cancelled: 2,    // Đã hủy
  Completed: 3     // Đã hoàn thành (sau khi checkout)
};

export const BookingStatusLabels = {
  [BookingStatus.Pending]: 'Pending',
  [BookingStatus.Confirmed]: 'Confirmed', 
  [BookingStatus.Cancelled]: 'Cancelled',
  [BookingStatus.Completed]: 'Completed'
};

export const BookingStatusColors = {
  [BookingStatus.Pending]: 'warning',
  [BookingStatus.Confirmed]: 'success',
  [BookingStatus.Cancelled]: 'error',
  [BookingStatus.Completed]: 'info'
};

// Helper function để convert status từ server sang label
export const getStatusLabel = (statusFromServer) => {
  // Nếu status từ server là string (enum name)
  if (typeof statusFromServer === 'string') {
    return statusFromServer;
  }
  
  // Nếu status từ server là number
  if (typeof statusFromServer === 'number') {
    return BookingStatusLabels[statusFromServer] || 'Unknown';
  }
  
  return 'Unknown';
};

// Helper function để convert status label sang number cho API
export const getStatusNumber = (statusLabel) => {
  const statusEntry = Object.entries(BookingStatusLabels).find(([, label]) => label === statusLabel);
  return statusEntry ? parseInt(statusEntry[0]) : BookingStatus.Pending;
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