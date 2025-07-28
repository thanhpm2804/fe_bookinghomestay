import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Pagination,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import {
  Search,
  FilterList,
  Refresh,
  Visibility,
  Edit,
  Delete,
  Person,
  Hotel,
  CalendarToday,
  AttachMoney
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { 
  bookingListService, 
  BookingStatus, 
  BookingStatusLabels, 
  BookingStatusColors,
  getStatusLabel,
  filterBookings,
  paginateData
} from '../../services/bookingList';

function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states - đơn giản hóa
  const [searchCustomer, setSearchCustomer] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Detail dialog states
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Auto hide notification
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Fetch data from API
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingListService.getBookings();
      setBookings(data);
    } catch (err) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings
  const filteredBookings = filterBookings(bookings, {
    searchCustomer,
    statusFilter,
    dateRange
  });

  // Paginate filtered data
  const paginatedBookings = paginateData(filteredBookings, currentPage, pageSize);
  const totalPages = Math.ceil(filteredBookings.length / pageSize);

  const clearFilters = () => {
    setSearchCustomer('');
    setStatusFilter('all');
    setDateRange({ start: null, end: null });
    setCurrentPage(1);
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const getStatusValue = (statusLabel) => {
    return Object.keys(BookingStatusLabels).find(key => 
      BookingStatusLabels[key] === statusLabel
    );
  };

  // Handle view booking details
  const handleViewDetails = (booking) => {
    console.log('Selected booking:', booking); // Debug log
    console.log('Booking details:', booking.BookingDetails); // Debug log
    setSelectedBooking(booking);
    setDetailDialogOpen(true);
  };

  // Handle close detail dialog
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedBooking(null);
  };

  // Handle update booking status
  const handleUpdateStatus = async (newStatus) => {
    if (!selectedBooking) return;

    setUpdatingStatus(true);
    try {
      await bookingListService.updateBookingStatus(selectedBooking.BookingId, newStatus);
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.BookingId === selectedBooking.BookingId 
            ? { ...booking, Status: getStatusLabel(newStatus) }
            : booking
        )
      );

      setNotification({ 
        show: true, 
        message: 'Cập nhật trạng thái thành công!', 
        type: 'success' 
      });
      
      handleCloseDetailDialog();
    } catch (error) {
      console.error('Error updating status:', error);
      setNotification({ 
        show: true, 
        message: error.message || 'Cập nhật trạng thái thất bại!', 
        type: 'error' 
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
        <Container maxWidth="xl">
          {/* Success/Error Notification */}
          {notification.show && (
            <Box
              sx={{
                position: 'fixed',
                top: 20,
                right: 20,
                zIndex: 9999,
                backgroundColor: notification.type === 'success' ? '#4caf50' : '#f44336',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '8px',
                boxShadow: notification.type === 'success' 
                  ? '0 4px 12px rgba(76, 175, 80, 0.3)' 
                  : '0 4px 12px rgba(244, 67, 54, 0.3)',
                minWidth: '250px',
                fontWeight: 600,
                fontSize: '14px',
                animation: 'slideInRight 0.3s ease-out',
                pointerEvents: 'none',
                '@keyframes slideInRight': {
                  '0%': {
                    transform: 'translateX(100%)',
                    opacity: 0
                  },
                  '100%': {
                    transform: 'translateX(0)',
                    opacity: 1
                  }
                }
              }}
            >
              {notification.message}
            </Box>
          )}

          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600, color: '#1976d2' }}>
            Danh Sách Đặt Phòng
          </Typography>

          {/* Simple Filters */}
          <Paper sx={{ p: 3, mb: 3, boxShadow: 1,justifyContent:'center',alignItems:'center' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Tìm Kiếm & Lọc
            </Typography>
            
            <Grid container spacing={3}>
              {/* Search Customer */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Tìm theo tên khách hàng"
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                  placeholder="Nhập tên khách hàng..."
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>

              {/* Status Filter */}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Trạng thái"
                  >
                    <MenuItem value="all">Tất cả trạng thái</MenuItem>
                    <MenuItem value={BookingStatus.Pending}>Đang chờ xác nhận</MenuItem>
                    <MenuItem value={BookingStatus.Confirmed}>Đã xác nhận</MenuItem>
                    <MenuItem value={BookingStatus.Cancelled}>Đã hủy</MenuItem>
                    <MenuItem value={BookingStatus.Completed}>Đã hoàn thành</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Date Range */}
              <Grid item xs={12} md={5}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Ngày đặt:
                  </Typography>
                  <DatePicker
                    label="Từ ngày"
                    value={dateRange.start}
                    onChange={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                    renderInput={(params) => <TextField {...params} size="small" />}
                  />
                  <Typography variant="body2" color="text.secondary">
                    đến
                  </Typography>
                  <DatePicker
                    label="Đến ngày"
                    value={dateRange.end}
                    onChange={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                    renderInput={(params) => <TextField {...params} size="small" />}
                  />
                </Box>
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={clearFilters}
                  >
                    Xóa bộ lọc
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<FilterList />}
                    onClick={fetchBookings}
                  >
                    Làm mới
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Results Summary */}
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Hiển thị {paginatedBookings.length} trong tổng số {filteredBookings.length} đặt phòng
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Trang {currentPage} / {totalPages}
            </Typography>
          </Box>

          {/* Bookings Table */}
          <Card>
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Khách hàng</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Ngày đặt</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Check-in</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Check-out</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Tổng tiền</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedBookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            Không có đặt phòng nào thỏa mãn điều kiện tìm kiếm
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedBookings.map((booking) => (
                        <TableRow key={booking.BookingId} hover>
                          <TableCell>{booking.BookingId}</TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2">
                                {booking.Customer?.FirstName} {booking.Customer?.LastName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {booking.Customer?.Email}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {format(parseISO(booking.DateBooked), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>
                            {format(parseISO(booking.DateCheckIn), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>
                            {format(parseISO(booking.DateCheckOut), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={booking.Status}
                              color={BookingStatusColors[getStatusValue(booking.Status)] || 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" color="primary">
                              {booking.TotalAmount?.toLocaleString('vi-VN')} ₫
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Xem chi tiết">
                              <IconButton 
                                color="primary" 
                                onClick={() => handleViewDetails(booking)}
                                size="small"
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Stack spacing={2}>
                <Pagination 
                  count={totalPages} 
                  page={currentPage} 
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton 
                  showLastButton
                />
              </Stack>
            </Box>
          )}

          {/* Booking Detail Dialog */}
          <Dialog 
            open={detailDialogOpen} 
            onClose={handleCloseDetailDialog} 
            maxWidth="md" 
            fullWidth
          >
            <DialogTitle>
              Chi Tiết Đặt Phòng #{selectedBooking?.BookingId}
            </DialogTitle>
            <DialogContent>
              {selectedBooking && (
                <Box>
                  {/* Customer Information */}
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person color="primary" />
                        Thông Tin Khách Hàng
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">Họ và tên:</Typography>
                          <Typography variant="body1">
                            {selectedBooking.Customer?.FirstName} {selectedBooking.Customer?.LastName}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">Email:</Typography>
                          <Typography variant="body1">{selectedBooking.Customer?.Email}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">Số điện thoại:</Typography>
                          <Typography variant="body1">
                            {selectedBooking.Customer?.PhoneNumber || 'Chưa cập nhật'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">Địa chỉ:</Typography>
                          <Typography variant="body1">
                            {selectedBooking.Customer?.Address || 'Chưa cập nhật'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* Booking Information */}
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday color="primary" />
                        Thông Tin Đặt Phòng
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary">Ngày đặt:</Typography>
                          <Typography variant="body1">
                            {format(parseISO(selectedBooking.DateBooked), 'dd/MM/yyyy HH:mm')}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary">Check-in:</Typography>
                          <Typography variant="body1">
                            {format(parseISO(selectedBooking.DateCheckIn), 'dd/MM/yyyy')}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary">Check-out:</Typography>
                          <Typography variant="body1">
                            {format(parseISO(selectedBooking.DateCheckOut), 'dd/MM/yyyy')}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">Trạng thái:</Typography>
                          <Chip 
                            label={selectedBooking.Status}
                            color={BookingStatusColors[getStatusValue(selectedBooking.Status)] || 'default'}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">Tổng tiền:</Typography>
                          <Typography variant="body1" color="primary" fontWeight="bold">
                            {selectedBooking.TotalAmount?.toLocaleString('vi-VN')} ₫
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* Room Details */}
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Hotel color="primary" />
                        Chi Tiết Phòng ({selectedBooking.BookingDetails?.length || 0} phòng)
                      </Typography>
                      {selectedBooking.BookingDetails && selectedBooking.BookingDetails.length > 0 ? (
                        <List>
                          {selectedBooking.BookingDetails.map((detail, index) => {
                            console.log('Detail:', detail); // Debug log
                            console.log('Room:', detail.Room); // Debug log
                            
                            return (
                              <Box key={detail.BookingDetailId}>
                                <ListItem>
                                  <ListItemText
                                    primary={
                                      <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                          {detail.Room?.Name || `Phòng ${detail.RoomId}`}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          {detail.Room?.Description || 'Không có mô tả'}
                                        </Typography>
                                      </Box>
                                    }
                                    secondary={
                                      <Box sx={{ mt: 1 }}>
                                        <Typography variant="body2">
                                          Sức chứa: {detail.Room?.Capacity || 'N/A'} người
                                        </Typography>
                                        <Typography variant="body2">
                                          Diện tích: {detail.Room?.Size || 'N/A'} m²
                                        </Typography>
                                        {detail.Room?.ImgUrl && (
                                          <Box sx={{ mt: 1 }}>
                                            <img 
                                              src={detail.Room.ImgUrl} 
                                              alt={detail.Room.Name}
                                              style={{ 
                                                width: '60px', 
                                                height: '45px', 
                                                objectFit: 'cover',
                                                borderRadius: '4px'
                                              }} 
                                            />
                                          </Box>
                                        )}
                                      </Box>
                                    }
                                  />
                                </ListItem>
                                {index < selectedBooking.BookingDetails.length - 1 && <Divider />}
                              </Box>
                            );
                          })}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                          Không có thông tin phòng
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetailDialog}>
                Đóng
              </Button>
              {selectedBooking && selectedBooking.Status !== BookingStatusLabels[BookingStatus.Completed] && (
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Cập nhật trạng thái</InputLabel>
                  <Select
                    value=""
                    onChange={(e) => handleUpdateStatus(parseInt(e.target.value))}
                    label="Cập nhật trạng thái"
                    disabled={updatingStatus}
                  >
                    {Object.entries(BookingStatusLabels).map(([key, label]) => (
                      <MenuItem key={key} value={key} disabled={label === selectedBooking.Status}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </LocalizationProvider>
  );
}

export default BookingList; 