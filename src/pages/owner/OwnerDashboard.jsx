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

const drawerWidth = 220;

const menuItems = [
  { text: 'Quản lý phòng', icon: <MeetingRoomIcon />, path: 'rooms' },
  { text: 'Cập nhật Homestay', icon: <HomeWorkIcon />, path: 'homestay' },
  { text: 'Doanh thu', icon: <AttachMoneyIcon />, path: 'revenue' },
  { text: 'Danh sách Booking', icon: <ListAltIcon />, path: 'bookings' },
];

function getUserInfo() {
  return {
    name: 'Owner Demo',
    email: 'owner@example.com',
  };
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
    <Box sx={{ display: 'flex', height: '100vh' }}>
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
            background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={location.pathname.endsWith(item.path)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    mb: 1,
                    '&.Mui-selected': {
                      background: 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)',
                      color: '#fff',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {/* AppBar */}
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            background: 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)',
            ml: `${drawerWidth}px`,
            width: `calc(100% - ${drawerWidth}px)`,
          }}
        >
          <Toolbar>
            <Typography variant="h5" fontWeight={700} sx={{ flexGrow: 1, letterSpacing: 1 }}>
              Owner Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, mr: 1 }}>{user.name}</Typography>
              <Avatar sx={{ bgcolor: '#fff', color: '#6366f1', fontWeight: 700, cursor: 'pointer' }} onClick={handleMenu}>
                {user.name[0]}
              </Avatar>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem disabled>{user.email}</MenuItem>
                <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
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
            bgcolor: '#f4f6fa',
            mt: 8, // offset AppBar height (64px)
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            p: 0,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default OwnerDashboard;
