import React, { useState, useEffect, useMemo } from 'react';
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
  Divider,
  Alert,
  CircularProgress,
  Container
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Hotel,
  CalendarToday,
  FilterList
} from '@mui/icons-material';
import { revenueService } from '../../services/revenue';
import { format, subDays, startOfDay, endOfDay, startOfMonth, startOfYear } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function Revenue() {
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('today');
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [selectedHomestay, setSelectedHomestay] = useState('all');


  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    averageRevenue: 0,
    revenueChange: 0,
    bookingChange: 0
  });

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await revenueService.getMyHomestays();

      setHomestays(response.value || []);
    } catch (err) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate statistics based on time range and homestay filter
  const calculateStats = () => {
    if (!homestays.length) return;

    const now = new Date();
    let startDate, endDate;

    switch (timeRange) {
      case 'today':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfDay(now);
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfDay(now);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = startOfDay(customStartDate);
          endDate = endOfDay(customEndDate);
        } else {
          return;
        }
        break;
      default:
        startDate = startOfDay(now);
        endDate = endOfDay(now);
    }

    // Filter homestays based on selection
    const filteredHomestays = selectedHomestay === 'all' 
      ? homestays 
      : homestays.filter(h => h.HomestayId.toString() === selectedHomestay);

    // Filter bookings by booking date
    const filteredBookings = filteredHomestays.flatMap(homestay => 
      homestay.Bookings?.filter(booking => {
        const bookingDate = new Date(booking.DateBooked);
        return bookingDate >= startDate && bookingDate <= endDate;
      }) || []
    );

    const totalRevenue = filteredBookings.reduce((sum, booking) => sum + (booking.TotalAmount || 0), 0);
    const totalBookings = filteredBookings.length;
    

    
    // Calculate average revenue based on time range
    let averageRevenue;
    if (timeRange === 'year') {
      // For year, calculate average per month (current month of the year)
      const currentMonth = now.getMonth() + 1; // +1 because getMonth() returns 0-11
      averageRevenue = totalRevenue / Math.max(1, currentMonth);
    } else if (timeRange === 'month') {
      // For month, calculate average per week
      const currentWeek = Math.ceil(now.getDate() / 7);
      averageRevenue = totalRevenue / Math.max(1, currentWeek);
    } else if (timeRange === 'custom') {
      // For custom, calculate average per day
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) || 1;
      averageRevenue = totalRevenue / daysDiff;
    } else {
      // For other periods (today), calculate average per day
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) || 1;
      averageRevenue = totalRevenue / daysDiff;
    }

    // Calculate change from previous period with correct date ranges
    let previousStartDate, previousEndDate;
    
    switch (timeRange) {
      case 'today':
        previousStartDate = startOfDay(subDays(now, 1));
        previousEndDate = endOfDay(subDays(now, 1));
        break;
      case 'month': {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousStartDate = startOfMonth(lastMonth);
        previousEndDate = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
        break;
      }
      case 'year': {
        const lastYear = new Date(now.getFullYear() - 1, 0, 1);
        previousStartDate = startOfYear(lastYear);
        previousEndDate = endOfDay(new Date(now.getFullYear(), 0, 0));
        break;
      }
      case 'custom':
        if (customStartDate && customEndDate) {
          const customDaysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
          previousEndDate = new Date(startDate.getTime() - 1);
          previousStartDate = new Date(previousEndDate.getTime() - (customDaysDiff * 24 * 60 * 60 * 1000));
        } else {
          return;
        }
        break;
      default:
        previousStartDate = startOfDay(subDays(now, 1));
        previousEndDate = endOfDay(subDays(now, 1));
    }

    const previousBookings = filteredHomestays.flatMap(homestay => 
      homestay.Bookings?.filter(booking => {
        const bookingDate = new Date(booking.DateBooked);
        return bookingDate >= previousStartDate && bookingDate <= previousEndDate;
      }) || []
    );
    const previousRevenue = previousBookings.reduce((sum, booking) => sum + (booking.TotalAmount || 0), 0);
    const previousBookingCount = previousBookings.length;

    // Calculate percentage changes with proper handling of edge cases
    const revenueChange = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : (totalRevenue > 0 ? 100 : 0);
    
    const bookingChange = previousBookingCount > 0 
      ? ((totalBookings - previousBookingCount) / previousBookingCount) * 100 
      : (totalBookings > 0 ? 100 : 0);



    setStats({
      totalRevenue,
      totalBookings,
      averageRevenue,
      revenueChange,
      bookingChange
    });
  };

  useEffect(() => {
    calculateStats();
  }, [homestays, timeRange, customStartDate, customEndDate, selectedHomestay]);

  // Prepare chart data
  const prepareChartData = () => {
    if (!homestays.length) return [];

    const now = new Date();
    let startDate, endDate, groupBy;

    switch (timeRange) {
      case 'today':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        groupBy = 'hour';
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfDay(now);
        groupBy = 'day';
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfDay(now);
        groupBy = 'month';
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = startOfDay(customStartDate);
          endDate = endOfDay(customEndDate);
          const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
          groupBy = daysDiff <= 31 ? 'day' : 'month';

        } else {
          return [];
        }
        break;
      default:
        return [];
    }

    // Filter homestays based on selection
    const filteredHomestays = selectedHomestay === 'all' 
      ? homestays 
      : homestays.filter(h => h.HomestayId.toString() === selectedHomestay);

    const filteredBookings = filteredHomestays.flatMap(homestay => 
      homestay.Bookings?.filter(booking => {
        const bookingDate = new Date(booking.DateBooked);
        return bookingDate >= startDate && bookingDate <= endDate;
      }) || []
    );

    // Create complete time series data
    const timeSeriesData = [];
    
    if (groupBy === 'hour') {
      // Generate 24 hours
      for (let i = 0; i < 24; i++) {
        const hour = i.toString().padStart(2, '0');
        timeSeriesData.push({
          name: `${hour}:00`,
          revenue: 0,
          bookings: 0
        });
      }
    } else if (groupBy === 'day') {
      // Generate days for the period
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        timeSeriesData.push({
          name: format(currentDate, 'dd/MM'),
          revenue: 0,
          bookings: 0
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

    } else if (groupBy === 'month') {
      // Generate months for the period
      if (timeRange === 'year') {
        // For year, generate all 12 months
        for (let i = 0; i < 12; i++) {
          const monthDate = new Date(now.getFullYear(), i, 1);
          timeSeriesData.push({
            name: format(monthDate, 'MM/yyyy'),
            revenue: 0,
            bookings: 0
          });
        }
      } else {
        // For custom range, generate months within the range
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          timeSeriesData.push({
            name: format(currentDate, 'MM/yyyy'),
            revenue: 0,
            bookings: 0
          });
          // Move to next month
          currentDate.setMonth(currentDate.getMonth() + 1);
          currentDate.setDate(1);
        }
      }
    }

    // Fill in actual data
    filteredBookings.forEach(booking => {
      const date = new Date(booking.DateBooked);
      let key;
      
      if (groupBy === 'hour') {
        key = format(date, 'HH:00');
      } else if (groupBy === 'day') {
        key = format(date, 'dd/MM');
      } else if (groupBy === 'month') {
        key = format(date, 'MM/yyyy');
      }

      const dataPoint = timeSeriesData.find(item => item.name === key);
      if (dataPoint) {
        dataPoint.revenue += booking.TotalAmount || 0;
        dataPoint.bookings += 1;
      }
    });

    return timeSeriesData;
  };

  // Prepare pie chart data for homestay performance
  const preparePieData = () => {
    if (!homestays.length) return [];

    const now = new Date();
    let startDate, endDate;

    switch (timeRange) {
      case 'today':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfDay(now);
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfDay(now);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = startOfDay(customStartDate);
          endDate = endOfDay(customEndDate);
        } else {
          return [];
        }
        break;
      default:
        startDate = startOfDay(now);
        endDate = endOfDay(now);
    }

    // Filter homestays based on selection
    const filteredHomestays = selectedHomestay === 'all' 
      ? homestays 
      : homestays.filter(h => h.HomestayId.toString() === selectedHomestay);

    return filteredHomestays.map(homestay => {
      const homestayBookings = homestay.Bookings?.filter(booking => {
        const bookingDate = new Date(booking.DateBooked);
        return bookingDate >= startDate && bookingDate <= endDate;
      }) || [];
      
      const homestayRevenue = homestayBookings.reduce((sum, booking) => sum + (booking.TotalAmount || 0), 0);
      return {
        name: homestay.Name,
        value: homestayRevenue
      };
    }).filter(item => item.value > 0);
  };

  const chartData = useMemo(() => prepareChartData(), [homestays, timeRange, customStartDate, customEndDate, selectedHomestay]);
  
  const pieData = useMemo(() => preparePieData(), [homestays, timeRange, customStartDate, customEndDate, selectedHomestay]);

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
            Thống Kê Doanh Thu
          </Typography>

          {/* Filters */}
          <Paper sx={{ p: 3, mb: 3, boxShadow: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <FormControl sx={{ minWidth: '200px', flex: '1 1 200px' }}>
                <InputLabel>Khoảng thời gian</InputLabel>
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  label="Khoảng thời gian"
                >
                  <MenuItem value="today">Hôm nay</MenuItem>
                  <MenuItem value="month">Tháng này</MenuItem>
                  <MenuItem value="year">Năm nay</MenuItem>
                  <MenuItem value="custom">Tùy chỉnh</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: '200px', flex: '1 1 200px' }}>
                <InputLabel>Chọn Homestay</InputLabel>
                <Select
                  value={selectedHomestay}
                  onChange={(e) => setSelectedHomestay(e.target.value)}
                  label="Chọn Homestay"
                >
                  <MenuItem value="all">Tất cả Homestay</MenuItem>
                  {homestays.map(homestay => (
                    <MenuItem key={homestay.HomestayId} value={homestay.HomestayId.toString()}>
                      {homestay.Name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>


              
              {timeRange === 'custom' && (
                <>
                  <DatePicker
                    label="Từ ngày"
                    value={customStartDate}
                    onChange={setCustomStartDate}
                    renderInput={(params) => (
                      <TextField {...params} sx={{ minWidth: '200px', flex: '1 1 200px' }} />
                    )}
                  />
                  <DatePicker
                    label="Đến ngày"
                    value={customEndDate}
                    onChange={setCustomEndDate}
                    renderInput={(params) => (
                      <TextField {...params} sx={{ minWidth: '200px', flex: '1 1 200px' }} />
                    )}
                  />
                </>
              )}
              
              <Button
                variant="contained"
                startIcon={<FilterList />}
                onClick={calculateStats}
                sx={{ 
                  minWidth: '150px',
                  flex: timeRange === 'custom' ? '0 0 auto' : '1 1 200px'
                }}
              >
                Áp dụng
              </Button>
            </Box>
          </Paper>

          {/* Statistics Cards */}
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 3, 
            mb: 3,
            '& > *': {
              flex: '1 1 250px',
              minWidth: '250px'
            }
          }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Tổng doanh thu
                    </Typography>
                    <Typography variant="h5">
                      {stats.totalRevenue.toLocaleString('vi-VN')} ₫
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      {stats.revenueChange >= 0 ? (
                        <TrendingUp color="success" fontSize="small" />
                      ) : (
                        <TrendingDown color="error" fontSize="small" />
                      )}
                      <Typography
                        variant="body2"
                        color={stats.revenueChange >= 0 ? 'success.main' : 'error.main'}
                        ml={0.5}
                      >
                        {stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                  <AttachMoney color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Tổng đặt phòng
                    </Typography>
                    <Typography variant="h5">
                      {stats.totalBookings}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      {stats.bookingChange >= 0 ? (
                        <TrendingUp color="success" fontSize="small" />
                      ) : (
                        <TrendingDown color="error" fontSize="small" />
                      )}
                      <Typography
                        variant="body2"
                        color={stats.bookingChange >= 0 ? 'success.main' : 'error.main'}
                        ml={0.5}
                      >
                        {stats.bookingChange >= 0 ? '+' : ''}{stats.bookingChange.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Hotel color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Doanh thu trung bình
                    </Typography>
                    <Typography variant="h5">
                      {stats.averageRevenue.toLocaleString('vi-VN')} ₫
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mt={1}>
                      {timeRange === 'year' ? 'Trên mỗi tháng' : 
                       timeRange === 'month' ? 'Trên mỗi tuần' : 
                       timeRange === 'custom' ? 'Trên mỗi ngày' :
                       'Trên mỗi ngày'}
                    </Typography>
                  </Box>
                  <CalendarToday color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Homestay hoạt động
                    </Typography>
                    <Typography variant="h5">
                      {homestays.filter(h => h.Bookings?.length > 0).length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mt={1}>
                      Trên tổng {homestays.length} homestay
                    </Typography>
                  </Box>
                  <Hotel color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Charts */}
          <Box sx={{ mb: 3 }}>
            {/* Top row - Bar and Pie charts */}
            <Box sx={{ 
              display: 'flex', 
              gap: 3, 
              mb: 3,
              flexDirection: { xs: 'column', md: 'row' },
              minHeight: '500px'
            }}>
              {/* Biểu đồ doanh thu theo thời gian */}
              <Card sx={{ 
                flex: '2 1 0%',
                minHeight: '400px',
                overflow: 'visible',
                p: 2
              }}>
                <CardContent sx={{ height: '100%', p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Biểu đồ doanh thu theo thời gian
                  </Typography>
                  <Box sx={{ 
                    width: '100%', 
                    height: 450, 
                    mt: 2, 
                    overflow: 'visible'
                  }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 50, left: 30, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={0}
                        />
                        <YAxis 
                          yAxisId="left"
                          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                          label={{ value: 'Doanh thu (triệu VNĐ)', angle: -90, position: 'insideLeft' }}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          tickFormatter={(value) => value}
                          label={{ value: 'Số đặt phòng', angle: 90, position: 'insideRight' }}
                        />
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === 'revenue') {
                              const formattedValue = value >= 1000000 
                                ? `${(value / 1000000).toFixed(1)} triệu VNĐ`
                                : value >= 1000 
                                ? `${(value / 1000).toFixed(0)} nghìn VNĐ`
                                : `${value.toLocaleString('vi-VN')} VNĐ`;
                              return [formattedValue, 'Doanh thu'];
                            }
                            if (name === 'bookings') {
                              return [value, 'Số đặt phòng'];
                            }
                            return [value, name];
                          }}
                          labelFormatter={(label) => label}
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            padding: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                          }}
                          wrapperStyle={{
                            zIndex: 9999
                          }}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="#8884d8" name="Doanh thu" yAxisId="left" />
                        <Bar dataKey="bookings" fill="#82ca9d" name="Số đặt phòng" yAxisId="right" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>

              {/* Biểu đồ hiệu suất Homestay */}
              <Card sx={{ 
                flex: '1 1 0%',
                minHeight: '450px',
                overflow: 'visible',
                p: 2,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" gutterBottom>
                    Hiệu suất Homestay
                  </Typography>
                  <Box sx={{ 
                    width: '100%', 
                    height: 350, 
                    overflow: 'visible',
                    flex: 1
                  }}>
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={{ stroke: '#666', strokeWidth: 1 }}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => {
                          const formattedValue = value >= 1000000 
                            ? `${(value / 1000000).toFixed(1)} triệu VNĐ`
                            : value >= 1000 
                            ? `${(value / 1000).toFixed(0)} nghìn VNĐ`
                            : `${value.toLocaleString('vi-VN')} VNĐ`;
                          return formattedValue;
                        }}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          padding: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}
                        wrapperStyle={{
                          zIndex: 9999
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Bottom row - Line chart */}
            <Card sx={{ width: '100%', overflow: 'visible', p: 2 }}>
              <CardContent sx={{ height: '100%', p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Xu hướng doanh thu
                </Typography>
                <Box sx={{ 
                  width: '100%', 
                  height: 500, 
                  mt: 2, 
                  overflow: 'visible'
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 50, left: 30, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                      />
                      <YAxis 
                        yAxisId="left"
                        tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                        label={{ value: 'Doanh thu (triệu VNĐ)', angle: -90, position: 'insideLeft' }}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        tickFormatter={(value) => value}
                        label={{ value: 'Số đặt phòng', angle: 90, position: 'insideRight' }}
                      />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'revenue') {
                            const formattedValue = value >= 1000000 
                              ? `${(value / 1000000).toFixed(1)} triệu VNĐ`
                              : value >= 1000 
                              ? `${(value / 1000).toFixed(0)} nghìn VNĐ`
                              : `${value.toLocaleString('vi-VN')} VNĐ`;
                            return [formattedValue, 'Doanh thu'];
                          }
                          if (name === 'bookings') {
                            return [value, 'Số đặt phòng'];
                          }
                          return [value, name];
                        }}
                        labelFormatter={(label) => label}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          padding: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}
                        wrapperStyle={{
                          zIndex: 9999
                        }}
                      />
                      <Legend />
                                          <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Doanh thu"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="bookings" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="Số đặt phòng"
                    />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Recent Bookings */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Đặt phòng gần đây
              </Typography>
              
              {/* Table Headers */}
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                alignItems: 'center',
                flexWrap: 'wrap',
                p: 2,
                borderBottom: '2px solid #e0e0e0',
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                mb: 2
              }}>
                <Box sx={{ flex: '2 1 0%', minWidth: '200px' }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="textSecondary">
                    Homestay
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 0%', minWidth: '120px' }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="textSecondary">
                    Ngày đặt
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 0%', minWidth: '120px' }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="textSecondary">
                    Check-in
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 0%', minWidth: '120px' }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="textSecondary">
                    Check-out
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 0%', minWidth: '100px' }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="textSecondary">
                    Trạng thái
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 0%', minWidth: '150px' }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="textSecondary">
                    Doanh thu
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {(() => {
                  const now = new Date();
                  let startDate, endDate;

                  switch (timeRange) {
                    case 'today':
                      startDate = startOfDay(now);
                      endDate = endOfDay(now);
                      break;
                    case 'month':
                      startDate = startOfMonth(now);
                      endDate = endOfDay(now);
                      break;
                    case 'year':
                      startDate = startOfYear(now);
                      endDate = endOfDay(now);
                      break;
                    case 'custom':
                      if (customStartDate && customEndDate) {
                        startDate = startOfDay(customStartDate);
                        endDate = endOfDay(customEndDate);
                      } else {
                        return <Typography color="textSecondary">Vui lòng chọn khoảng thời gian</Typography>;
                      }
                      break;
                    default:
                      startDate = startOfDay(now);
                      endDate = endOfDay(now);
                  }

                  // Filter homestays based on selection
                  const filteredHomestays = selectedHomestay === 'all' 
                    ? homestays 
                    : homestays.filter(h => h.HomestayId.toString() === selectedHomestay);

                  const filteredBookings = filteredHomestays.flatMap(homestay => 
                    homestay.Bookings?.filter(booking => {
                      const bookingDate = new Date(booking.DateBooked);
                      return bookingDate >= startDate && bookingDate <= endDate;
                    }).map(booking => ({ ...booking, homestayName: homestay.Name })) || []
                  ).sort((a, b) => {
                    const dateA = new Date(a.DateBooked);
                    const dateB = new Date(b.DateBooked);
                    return dateB - dateA;
                  }).slice(0, 10);



                  if (filteredBookings.length === 0) {
                    return (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="textSecondary">
                          Không có đặt phòng nào trong khoảng thời gian này
                        </Typography>
                      </Box>
                    );
                  }

                  return filteredBookings.map(booking => (
                    <Box 
                      key={booking.BookingId} 
                      sx={{ 
                        p: 2, 
                        border: '1px solid #eee', 
                        borderRadius: 1, 
                        mb: 1,
                        backgroundColor: '#fafafa'
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 2, 
                        alignItems: 'center',
                        flexWrap: 'wrap'
                      }}>
                        <Box sx={{ flex: '2 1 0%', minWidth: '200px' }}>
                          <Typography variant="subtitle2" color="primary">
                            {booking.homestayName}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: '1 1 0%', minWidth: '120px' }}>
                          <Typography variant="body2">
                            {format(new Date(booking.DateBooked), 'dd/MM/yyyy')}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: '1 1 0%', minWidth: '120px' }}>
                          <Typography variant="body2">
                            {format(new Date(booking.DateCheckIn), 'dd/MM/yyyy')}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: '1 1 0%', minWidth: '120px' }}>
                          <Typography variant="body2">
                            {format(new Date(booking.DateCheckOut), 'dd/MM/yyyy')}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: '1 1 0%', minWidth: '100px' }}>
                          <Chip 
                            label={booking.Status} 
                            color={booking.Status === 'Confirmed' ? 'success' : 'warning'}
                            size="small"
                          />
                        </Box>
                        <Box sx={{ flex: '1 1 0%', minWidth: '150px' }}>
                          <Typography variant="h6" color="primary">
                            {booking.TotalAmount?.toLocaleString('vi-VN')} ₫
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ));
                })()}
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </LocalizationProvider>
  );
}

export default Revenue; 