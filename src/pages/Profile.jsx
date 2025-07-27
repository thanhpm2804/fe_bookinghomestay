import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Avatar,
  Divider
} from '@mui/material';
import Toolbar from '../components/Toolbar';
import Footer from '../components/Footer';

function Profile() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <Toolbar />
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4, flex: 1 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Stack spacing={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ 
                  width: 100, 
                  height: 100, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: '#1976d2',
                  fontSize: '2rem'
                }}
              >
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Typography variant="h4" fontWeight={600} color="primary">
                Thông tin cá nhân
              </Typography>
            </Box>
            
            <Divider />
            
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="h6">
                  {user?.email || 'Chưa có thông tin'}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Họ và tên
                </Typography>
                <Typography variant="h6">
                  {user?.fullName || 'Chưa có thông tin'}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Số điện thoại
                </Typography>
                <Typography variant="h6">
                  {user?.phone || 'Chưa có thông tin'}
                </Typography>
              </Box>
            </Stack>
            
            <Divider />
            
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                onClick={() => navigate('/home')}
                sx={{ mr: 2 }}
              >
                Về trang chủ
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/help')}
              >
                Trợ giúp
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Box>
      <Footer />
    </Box>
  );
}

export default Profile; 