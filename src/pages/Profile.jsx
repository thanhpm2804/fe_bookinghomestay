import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  Alert,
  CircularProgress,
  Avatar,
  Stack,
  Divider,
  IconButton,
  InputAdornment,
  Container
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

const Profile = () => {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy thông tin user từ localStorage hoặc API
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token ? 'exists' : 'not found');
    console.log('Token value:', token);
    
    // Decode JWT token để kiểm tra
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decoded = JSON.parse(jsonPayload);
        console.log('Decoded JWT payload:', decoded);
        console.log('JWT expiration:', new Date(decoded.exp * 1000));
        console.log('JWT is expired:', Date.now() > decoded.exp * 1000);
      } catch (error) {
        console.error('Error decoding JWT:', error);
      }
    }
    
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }

    // Lấy thông tin user từ API
    const fetchUserProfile = async () => {
      try {
        console.log('Fetching user profile from API...');
        console.log('Request URL:', '/api/Users/profile');
        console.log('Request headers:', {
          'Authorization': `Bearer ${token}`
        });
        
        const res = await fetch('/api/Users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('API response status:', res.status);
        console.log('API response ok:', res.ok);
        console.log('API response headers:', Object.fromEntries(res.headers.entries()));

        if (res.ok) {
          const userData = await res.json();
          console.log('User data received:', userData);
          setUser({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phoneNumber: userData.phoneNumber || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        } else {
          const errorData = await res.text();
          console.error('API error response:', errorData);
          console.error('Failed to fetch user profile, status:', res.status);
          
          // Chỉ redirect nếu là lỗi 401 (Unauthorized)
          if (res.status === 401) {
            console.log('Unauthorized, redirecting to login');
            navigate('/login');
          } else {
            setError(`Lỗi server: ${res.status} - ${errorData}`);
          }
        }
      } catch (err) {
        console.error('Network error fetching user profile:', err);
        setError('Lỗi kết nối server! Vui lòng kiểm tra kết nối mạng.');
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/Users/update-profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber
        }),
      });

      if (res.ok) {
        setMessage('Cập nhật thông tin thành công!');
        setIsEditing(false);
      } else {
        const data = await res.json();
        setError(data.message || 'Cập nhật thất bại!');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setError('Lỗi kết nối server!');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (user.newPassword !== user.confirmPassword) {
      setError('Mật khẩu mới không khớp!');
      setLoading(false);
      return;
    }

    if (user.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự!');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/Users/change-password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: user.currentPassword,
          newPassword: user.newPassword
        }),
      });

      if (res.ok) {
        setMessage('Đổi mật khẩu thành công!');
        setUser({
          ...user,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const data = await res.json();
        setError(data.message || 'Đổi mật khẩu thất bại!');
      }
    } catch (err) {
      console.error('Change password error:', err);
      setError('Lỗi kết nối server!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper
          elevation={24}
          sx={{
            borderRadius: 4,
            p: 4,
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 40px 0 rgba(31, 38, 135, 0.18), 0 1.5px 8px 0 rgba(102,126,234,0.10)',
            border: '3px solid',
            borderImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1',
            overflow: 'visible',
            mx: 'auto'
          }}
        >
          {/* Header */}
          <Box sx={{ flexShrink: 0, mb: 3 }}>
            <Box textAlign="center" mb={3}>
              <Typography variant="h3" fontWeight={800} gutterBottom sx={{
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Hồ sơ cá nhân
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                Cập nhật thông tin cá nhân và bảo mật tài khoản
              </Typography>
            </Box>
          </Box>

          {/* Alerts */}
          <Box sx={{ flexShrink: 0, mb: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {message && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, px: 1 }}>
            <Grid container spacing={3}>
              {/* Thông tin cá nhân */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  p: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    zIndex: 1
                  }
                }}>
                  <Box sx={{ position: 'relative', zIndex: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ 
                          mr: 2, 
                          p: 1, 
                          borderRadius: '50%', 
                          bgcolor: 'rgba(255,255,255,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <PersonIcon sx={{ fontSize: 24, color: 'white' }} />
                        </Box>
                        <Typography variant="h6" fontWeight={600}>
                          Thông tin cá nhân
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={() => setIsEditing(!isEditing)}
                        sx={{ 
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>

                    <Box component="form" onSubmit={handleUpdateProfile}>
                      <Stack spacing={3}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Họ"
                              name="firstName"
                              value={user.firstName}
                              onChange={handleChange}
                              disabled={!isEditing}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  bgcolor: 'white',
                                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                  '&:hover fieldset': { borderColor: 'white' },
                                  '&.Mui-focused fieldset': { borderColor: 'white' }
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)', fontWeight: 600 },
                                '& .MuiInputLabel-root.Mui-focused': { color: 'white', fontWeight: 600 },
                                '& .MuiInputBase-input': { color: '#333', fontWeight: 500 }
                              }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Tên"
                              name="lastName"
                              value={user.lastName}
                              onChange={handleChange}
                              disabled={!isEditing}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  bgcolor: 'white',
                                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                  '&:hover fieldset': { borderColor: 'white' },
                                  '&.Mui-focused fieldset': { borderColor: 'white' }
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)', fontWeight: 600 },
                                '& .MuiInputLabel-root.Mui-focused': { color: 'white', fontWeight: 600 },
                                '& .MuiInputBase-input': { color: '#333', fontWeight: 500 }
                              }}
                            />
                          </Grid>
                        </Grid>

                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          value={user.email}
                          disabled
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'rgba(255,255,255,0.9)',
                              '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                              '&:hover fieldset': { borderColor: 'white' },
                              '&.Mui-focused fieldset': { borderColor: 'white' }
                            },
                            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)', fontWeight: 600 },
                            '& .MuiInputLabel-root.Mui-focused': { color: 'white', fontWeight: 600 },
                            '& .MuiInputBase-input': { color: '#333', fontWeight: 500 }
                          }}
                        />

                        <TextField
                          fullWidth
                          label="Số điện thoại"
                          name="phoneNumber"
                          value={user.phoneNumber}
                          onChange={handleChange}
                          disabled={!isEditing}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'white',
                              '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                              '&:hover fieldset': { borderColor: 'white' },
                              '&.Mui-focused fieldset': { borderColor: 'white' }
                            },
                            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)', fontWeight: 600 },
                            '& .MuiInputLabel-root.Mui-focused': { color: 'white', fontWeight: 600 },
                            '& .MuiInputBase-input': { color: '#333', fontWeight: 500 }
                          }}
                        />

                        {isEditing && (
                          <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                            sx={{
                              mt: 2,
                              background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                              boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                              }
                            }}
                          >
                            {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  </Box>
                </Card>
              </Grid>

              {/* Đổi mật khẩu */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  p: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    zIndex: 1
                  }
                }}>
                  <Box sx={{ position: 'relative', zIndex: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box sx={{ 
                        mr: 2, 
                        p: 1, 
                        borderRadius: '50%', 
                        bgcolor: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <PersonIcon sx={{ fontSize: 24, color: 'white' }} />
                      </Box>
                      <Typography variant="h6" fontWeight={600}>
                        Bảo mật tài khoản
                      </Typography>
                    </Box>

                    <Box component="form" onSubmit={handleChangePassword}>
                      <Stack spacing={3}>
                        <TextField
                          fullWidth
                          label="Mật khẩu hiện tại"
                          name="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={user.currentPassword}
                          onChange={handleChange}
                          required
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                  edge="end"
                                  sx={{ color: 'rgba(255,255,255,0.8)' }}
                                >
                                  {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'white',
                              '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                              '&:hover fieldset': { borderColor: 'white' },
                              '&.Mui-focused fieldset': { borderColor: 'white' }
                            },
                            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)', fontWeight: 600 },
                            '& .MuiInputLabel-root.Mui-focused': { color: 'white', fontWeight: 600 },
                            '& .MuiInputBase-input': { color: '#333', fontWeight: 500 }
                          }}
                        />

                        <TextField
                          fullWidth
                          label="Mật khẩu mới"
                          name="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={user.newPassword}
                          onChange={handleChange}
                          required
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  edge="end"
                                  sx={{ color: 'rgba(255,255,255,0.8)' }}
                                >
                                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'white',
                              '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                              '&:hover fieldset': { borderColor: 'white' },
                              '&.Mui-focused fieldset': { borderColor: 'white' }
                            },
                            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)', fontWeight: 600 },
                            '& .MuiInputLabel-root.Mui-focused': { color: 'white', fontWeight: 600 },
                            '& .MuiInputBase-input': { color: '#333', fontWeight: 500 }
                          }}
                        />

                        <TextField
                          fullWidth
                          label="Xác nhận mật khẩu mới"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={user.confirmPassword}
                          onChange={handleChange}
                          required
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  edge="end"
                                  sx={{ color: 'rgba(255,255,255,0.8)' }}
                                >
                                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'white',
                              '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                              '&:hover fieldset': { borderColor: 'white' },
                              '&.Mui-focused fieldset': { borderColor: 'white' }
                            },
                            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)', fontWeight: 600 },
                            '& .MuiInputLabel-root.Mui-focused': { color: 'white', fontWeight: 600 },
                            '& .MuiInputBase-input': { color: '#333', fontWeight: 500 }
                          }}
                        />

                        {user.newPassword && user.confirmPassword && user.newPassword !== user.confirmPassword && (
                          <Alert severity="error" sx={{ 
                            bgcolor: 'rgba(255,107,107,0.1)', 
                            color: '#ff6b6b',
                            border: '1px solid #ff6b6b'
                          }}>
                            ⚠️ Mật khẩu xác nhận không khớp
                          </Alert>
                        )}

                        {user.newPassword && user.newPassword.length < 6 && (
                          <Alert severity="warning" sx={{ 
                            bgcolor: 'rgba(255,193,7,0.1)', 
                            color: '#f57c00',
                            border: '1px solid #f57c00'
                          }}>
                            💡 Mật khẩu mới phải có ít nhất 6 ký tự
                          </Alert>
                        )}

                        <Button
                          type="submit"
                          variant="contained"
                          disabled={loading || !user.currentPassword || !user.newPassword || !user.confirmPassword || user.newPassword !== user.confirmPassword}
                          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                          sx={{
                            mt: 2,
                            background: 'linear-gradient(45deg, #ff9800 30%, #ffb74d 90%)',
                            boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #f57c00 30%, #ff9800 90%)',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 6px 20px rgba(255, 152, 0, 0.4)',
                            },
                            '&:disabled': {
                              background: '#e0e0e0',
                              color: '#757575',
                              boxShadow: 'none',
                              transform: 'none'
                            }
                          }}
                        >
                          {loading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
                        </Button>
                      </Stack>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Profile; 