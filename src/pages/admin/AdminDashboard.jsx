import React from 'react';
import { Box, Typography, Paper, Container } from '@mui/material';

function AdminDashboard() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 240 }}>
        <Typography component="h1" variant="h4" color="primary" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Chào mừng đến với trang quản trị hệ thống
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Tính năng quản trị sẽ được phát triển trong tương lai.
        </Typography>
      </Paper>
    </Container>
  );
}

export default AdminDashboard; 