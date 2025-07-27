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
  Stack
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
  Delete
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { 
  bookingListService, 
  BookingStatus, 
  BookingStatusLabels, 
  BookingStatusColors,
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
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600, color: '#1976d2' }}>
            Danh Sách Đặt Phòng
          </Typography>

          {/* Simple Filters */}
          <Paper sx={{ p: 3, mb: 3, boxShadow: 1 }}>
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
                      <TableCell sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
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
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Xem chi tiết">
                                <IconButton size="small" color="primary">
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Chỉnh sửa">
                                <IconButton size="small" color="secondary">
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa">
                                <IconButton size="small" color="error">
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </Box>
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
        </Container>
      </Box>
    </LocalizationProvider>
  );
}

export default BookingList; 