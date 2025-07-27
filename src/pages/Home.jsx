import React from 'react';
import { Typography, Box, Container, Paper, Grid, Card, CardContent } from '@mui/material';
import Navigation from '../components/Navigation';

function Home() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h3" color="primary" gutterBottom>
                Chào mừng bạn đến với Homestay Booking!
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                Khám phá những homestay tuyệt vời và đặt chỗ nghỉ dưỡng của bạn
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  🏠 Tìm Homestay
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Khám phá hàng nghìn homestay đẹp với giá tốt nhất
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  📅 Đặt Chỗ
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Đặt chỗ dễ dàng và nhanh chóng với hệ thống đặt phòng thông minh
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  ⭐ Đánh Giá
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Chia sẻ trải nghiệm và đọc đánh giá từ khách hàng khác
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Home; 