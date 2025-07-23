import React from 'react';
import { Typography, Box } from '@mui/material';

function Home() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
      <Typography variant="h3" color="primary">Chào mừng bạn đã đăng nhập thành công!</Typography>
    </Box>
  );
}
export default Home; 