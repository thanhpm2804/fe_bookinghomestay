import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            backgroundColor: '#fff',
            maxWidth: 400,
            width: '100%'
          }}
        >
          <LockIcon sx={{ fontSize: 64, color: '#f44336', mb: 2 }} />
          
          <Typography variant="h4" component="h1" gutterBottom color="error">
            403 - Unauthorized
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Bạn không có quyền truy cập vào trang này.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{ minWidth: 120 }}
            >
              Đăng nhập
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => navigate('/home')}
              sx={{ minWidth: 120 }}
            >
              Về trang chủ
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Unauthorized;
  