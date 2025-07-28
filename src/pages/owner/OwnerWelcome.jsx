import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Avatar, Chip, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ListAltIcon from '@mui/icons-material/ListAlt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';

function OwnerWelcome() {
  const stats = [
    {
      title: 'Tổng phòng',
      value: '24',
      icon: <MeetingRoomIcon />,
      color: '#6366f1',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Đặt phòng hôm nay',
      value: '8',
      icon: <ListAltIcon />,
      color: '#06b6d4',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'Doanh thu tháng',
      value: '45.2M',
      icon: <AttachMoneyIcon />,
      color: '#10b981',
      change: '+18%',
      changeType: 'positive'
    },
    {
      title: 'Đánh giá trung bình',
      value: '4.8',
      icon: <StarIcon />,
      color: '#f59e0b',
      change: '+0.2',
      changeType: 'positive'
    }
  ];

  const quickActions = [
    {
      title: 'Quản lý phòng',
      description: 'Thêm, sửa, xóa phòng và cập nhật thông tin',
      icon: <MeetingRoomIcon />,
      path: 'rooms',
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
    },
    {
      title: 'Cập nhật Homestay',
      description: 'Chỉnh sửa thông tin và hình ảnh homestay',
      icon: <HomeWorkIcon />,
      path: 'homestay',
      color: '#06b6d4',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
    },
    {
      title: 'Xem doanh thu',
      description: 'Theo dõi doanh thu và báo cáo chi tiết',
      icon: <AttachMoneyIcon />,
      path: 'revenue',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    {
      title: 'Danh sách Booking',
      description: 'Quản lý đặt phòng và trạng thái khách hàng',
      icon: <ListAltIcon />,
      path: 'bookings',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    }
  ];

  return (
    <Box sx={{ maxWidth: '100%' }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={800} sx={{ 
          background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1
        }}>
          Chào mừng trở lại! 👋
        </Typography>
        <Typography variant="h6" sx={{ 
          color: '#64748b',
          fontWeight: 500,
          mb: 3
        }}>
          Đây là tổng quan về hoạt động homestay của bạn
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: '#1e293b' }}>
          Thống kê tổng quan
        </Typography>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Avatar sx={{
                      width: 48,
                      height: 48,
                      background: stat.color,
                      boxShadow: `0 4px 12px ${stat.color}40`
                    }}>
                      {stat.icon}
                    </Avatar>
                    <Chip
                      label={stat.change}
                      size="small"
                      sx={{
                        background: stat.changeType === 'positive' ? '#dcfce7' : '#fef2f2',
                        color: stat.changeType === 'positive' ? '#166534' : '#dc2626',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>
                  <Typography variant="h4" fontWeight={800} sx={{ 
                    color: '#1e293b',
                    mb: 0.5
                  }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#64748b',
                    fontWeight: 500
                  }}>
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: '#1e293b' }}>
          Thao tác nhanh
        </Typography>
        <Grid container spacing={3}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                component={Link}
                to={action.path}
                sx={{
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                  }
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Avatar sx={{
                    width: 64,
                    height: 64,
                    background: action.gradient,
                    margin: '0 auto 16px',
                    boxShadow: `0 8px 24px ${action.color}40`
                  }}>
                    {action.icon}
                  </Avatar>
                  <Typography variant="h6" fontWeight={700} sx={{ 
                    color: '#1e293b',
                    mb: 1
                  }}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#64748b',
                    lineHeight: 1.5
                  }}>
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Recent Activity */}
      <Box>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: '#1e293b' }}>
          Hoạt động gần đây
        </Typography>
        <Card sx={{
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
              }}>
                <PeopleIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#1e293b' }}>
                  Khách hàng mới đặt phòng
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Nguyễn Văn A vừa đặt phòng Deluxe cho ngày 25/12/2024
                </Typography>
              </Box>
              <Chip
                label="Mới"
                size="small"
                sx={{
                  background: '#dcfce7',
                  color: '#166534',
                  fontWeight: 600,
                  ml: 'auto'
                }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              }}>
                <TrendingUpIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#1e293b' }}>
                  Doanh thu tăng trưởng
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Doanh thu tháng này tăng 18% so với tháng trước
                </Typography>
              </Box>
              <Chip
                label="+18%"
                size="small"
                sx={{
                  background: '#dcfce7',
                  color: '#166534',
                  fontWeight: 600,
                  ml: 'auto'
                }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
              }}>
                <StarIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#1e293b' }}>
                  Đánh giá mới
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Khách hàng đã đánh giá 5 sao cho phòng Premium
                </Typography>
              </Box>
              <Chip
                label="5★"
                size="small"
                sx={{
                  background: '#fef3c7',
                  color: '#92400e',
                  fontWeight: 600,
                  ml: 'auto'
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default OwnerWelcome; 