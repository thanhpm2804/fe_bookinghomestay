// fe_bookinghomestay/src/components/admin/ViewTotalRevenue.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Grid,
  Paper
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { API_BASE_URL } from '../../configs/apiConfig';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

function ViewTotalRevenue() {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Month names for display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Fetch revenue data
  const fetchRevenueData = async (year) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}api/Statistics/revenue-by-month?year=${year}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch revenue data');
      }

      const data = await response.json();
      console.log(data);
      // Transform data for chart display
      const chartData = data.map(item => ({
        month: monthNames[item.Month - 1], // Convert month number to name
        revenue: parseFloat(item.Revenue), // Convert decimal to number
        monthNumber: item.Month
      }));

      setRevenueData(chartData);
    } catch (err) {
      setError(err.message || 'Error fetching revenue data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData(selectedYear);
  }, [selectedYear]);

  // Calculate total revenue
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);

  // Calculate average monthly revenue
  const averageRevenue = revenueData.length > 0 ? totalRevenue / revenueData.length : 0;

  // Find best performing month
  const bestMonth = revenueData.length > 0 
    ? revenueData.reduce((max, item) => item.revenue > max.revenue ? item : max)
    : null;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
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
    <Box sx={{ backgroundColor: 'white', borderRadius: 2, p: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          fontWeight: 600, 
          color: '#2c3e50',
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <AttachMoneyIcon sx={{ color: '#27ae60' }} />
        Total Revenue Analytics
      </Typography>

      {/* Year Selector */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Select Year</InputLabel>
          <Select
            value={selectedYear}
            label="Select Year"
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Revenue ({selectedYear})
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                ${totalRevenue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Monthly Revenue
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                ${averageRevenue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Best Performing Month
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {bestMonth ? bestMonth.month : 'N/A'}
              </Typography>
              {bestMonth && (
                <Typography variant="body2">
                  ${bestMonth.revenue.toLocaleString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Revenue Chart */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Monthly Revenue Breakdown
        </Typography>
        
        <Box sx={{ width: '100%', height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis 
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                label={{ 
                  value: 'Revenue ($)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
              />
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                labelFormatter={(label) => `${label} ${selectedYear}`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              />
              <Legend />
              <Bar 
                dataKey="revenue" 
                fill="#8884d8" 
                name="Revenue"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
}

export default ViewTotalRevenue;