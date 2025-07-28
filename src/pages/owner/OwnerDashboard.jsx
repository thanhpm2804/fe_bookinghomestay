import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  CssBaseline
} from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ListAltIcon from '@mui/icons-material/ListAlt';
import '../../styles/owner.css';
import { jwtDecode } from 'jwt-decode';
const drawerWidth = 280;

const menuItems = [
  
  { 
    text: 'Quản lý phòng', 
    icon: <MeetingRoomIcon />, 
    path: 'rooms',
    description: 'Thêm, sửa, xóa phòng'
  },
  { 
    text: 'Cập nhật Homestay', 
    icon: <HomeWorkIcon />, 
    path: 'homestay',
    description: 'Chỉnh sửa thông tin homestay'
  },
  { 
    text: 'Doanh thu', 
    icon: <AttachMoneyIcon />, 
    path: 'revenue',
    description: 'Theo dõi doanh thu và báo cáo'
  },
  { 
    text: 'Danh sách Booking', 
    icon: <ListAltIcon />, 
    path: 'bookings',
    description: 'Quản lý đặt phòng của khách'
  },
];

function getUserInfo() {
  const token = localStorage.getItem('token');

  if (!token) {
    return null; // hoặc trả về thông tin mặc định
  }

  try {
    const decoded = jwtDecode(token);

    return {
      name: decoded.name || decoded.unique_name || 'Unknown',
      email: decoded.email || 'Unknown',
    };
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}

function OwnerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUserInfo();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f0f4f8' }}>
    <CssBaseline />
  
    {/* Drawer */}
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
          borderRight: 'none',
          boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
        },
      }}
    >
      <Toolbar />
      
      {/* Logo/Brand Section */}
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        mb: 2
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          mb: 1
        }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}>
            <HomeWorkIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Typography variant="h6" sx={{ 
            color: 'white', 
            fontWeight: 700,
            letterSpacing: '0.5px'
          }}>
            Owner Dashboard
          </Typography>
        </Box>
        
      </Box>

      <Box sx={{ overflowY: 'auto', px: 2 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text}  disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={location.pathname.endsWith(item.path)}
                sx={{
                  borderRadius: '12px',
                  px: 3,
                  py: 2.5,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    transform: 'translateX(4px)',
                  },
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                    color: '#fff',
                    boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '4px',
                      background: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)',
                      borderRadius: '0 2px 2px 0'
                    }
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: 'inherit', 
                  minWidth: 40,
                  '& .MuiSvgIcon-root': {
                    fontSize: '1.5rem',
                    color: 'white '
                  }
                }}>
                  {item.icon}
                </ListItemIcon>
                <Box sx={{ flex: 1 }}>
                  <ListItemText 
                    
                    primary={item.text} 
                    primaryTypographyProps={{
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      color: 'white '
                    }}
                  />
                  <Typography variant="caption" sx={{ 
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.75rem',
                    lineHeight: 1.2
                  }}>
                    {item.description}
                  </Typography>
                </Box>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  
    {/* Main section */}
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
  
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          color: '#1e293b',
          ml: `${drawerWidth}px`,
          width: `calc(100% - ${drawerWidth}px)`,
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <Toolbar sx={{ px: 3, py: 1 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" fontWeight={800} sx={{ 
              background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px'
            }}>
              Dashboard
            </Typography>
            <Typography variant="body2" sx={{ 
              color: '#64748b',
              fontWeight: 500,
              mt: 0.5
            }}>
              Quản lý hệ thống homestay của bạn
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            p: 1,
            borderRadius: '12px',
            background: 'rgba(99, 102, 241, 0.05)',
            border: '1px solid rgba(99, 102, 241, 0.1)'
          }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: 700, 
                color: '#1e293b',
                lineHeight: 1.2
              }}>
                {user.name}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#64748b',
                fontSize: '0.75rem'
              }}>
                {user.email}
              </Typography>
            </Box>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                border: '2px solid rgba(255,255,255,0.2)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
                },
              }}
              onClick={handleMenu}
            >
              {user.name[0]}
            </Avatar>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  minWidth: 200
                }
              }}
            >
              <MenuItem disabled sx={{ 
                opacity: 0.7,
                fontSize: '0.875rem',
                color: '#64748b'
              }}>
                {user.email}
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{
                color: '#ef4444',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.08)'
                }
              }}>
                Đăng xuất
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
  
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          mt: 8,
          px: 4,
          py: 3,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  </Box>
  
  );
}

export default OwnerDashboard;
