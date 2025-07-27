import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Alert,
  CircularProgress,
  Stack,
  InputAdornment,
  IconButton,
  Card
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import EmailIcon from '@mui/icons-material/Email';

const Register = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [code, setCode] = useState('');

  const navigate = useNavigate();

  const steps = ['Thông tin cá nhân', 'Xác nhận email'];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      setLoading(false);
      return;
    }

    try {
      console.log('Sending registration data:', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        role: 'Customer'
      });

      // Thử với các endpoint khác nhau
      const endpoints = [
        '/api/Account/register',
        '/api/account/register',
        '/api/Account/register-customer',
        '/api/account/register-customer'
      ];

      let res;
      let lastError;

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstName: form.firstName,
              lastName: form.lastName,
              email: form.email,
              password: form.password,
              phoneNumber: form.phoneNumber,
              role: 'Customer'
            }),
          });

          if (res.ok) {
            console.log(`Success with endpoint: ${endpoint}`);
            break;
          } else {
            console.log(`Failed with endpoint: ${endpoint}, status: ${res.status}`);
          }
        } catch (err) {
          console.log(`Error with endpoint: ${endpoint}`, err);
          lastError = err;
        }
      }

      if (!res || !res.ok) {
        throw lastError || new Error(`All endpoints failed. Last status: ${res?.status}`);
      }

      console.log('Registration response status:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('Registration success:', data);
        setMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.');
        setActiveStep(1);
      } else {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = { message: 'Đăng ký thất bại!' };
        }
        console.error('Registration failed:', errorData);
        setError(errorData.message || `Đăng ký thất bại! Status: ${res.status}`);
      }
    } catch (err) {
      console.error('Register error:', err);
      setError(`Lỗi kết nối server! Chi tiết: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await fetch('/api/Account/confirm-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, code }),
      });
      
      if (res.ok) {
        setMessage('Xác nhận thành công! Chuyển hướng đến trang đăng nhập...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const data = await res.json();
        setError(data.message || 'Xác nhận thất bại!');
      }
    } catch (err) {
      console.error('Confirm error:', err);
      setError('Lỗi kết nối server!');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await fetch('/api/Account/resend-confirmation-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      
      if (res.ok) {
        setMessage('Đã gửi lại mã xác nhận!');
      } else {
        const data = await res.json();
        setError(data.message || 'Gửi lại mã thất bại!');
      }
    } catch (err) {
      console.error('Resend error:', err);
      setError('Lỗi kết nối server!');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ 
              mb: 3, 
              textAlign: 'center', 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Đăng ký Customer
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  p: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                  borderRadius: 2,
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
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        mr: 1.5, 
                        p: 1, 
                        borderRadius: '50%', 
                        bgcolor: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <PersonIcon sx={{ fontSize: 20, color: 'white' }} />
                      </Box>
                      <Typography variant="h6" fontWeight={600}>
                        Thông tin cá nhân
                      </Typography>
                    </Box>
                    
                    <Stack spacing={2}>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            name="firstName"
                            label="Họ *"
                            value={form.firstName}
                            onChange={handleChange}
                            required
                            placeholder="Ví dụ: Nguyễn"
                            helperText="Nhập họ của bạn (bắt buộc)"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
                                '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                '&:hover fieldset': { borderColor: 'white' },
                                '&.Mui-focused fieldset': { borderColor: 'white' }
                              },
                              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)', fontWeight: 600 },
                              '& .MuiInputLabel-root.Mui-focused': { color: 'white', fontWeight: 600 },
                              '& .MuiInputBase-input': { color: '#333', fontWeight: 500 },
                              '& .MuiFormHelperText-root': { 
                                color: 'rgba(255,255,255,0.8)', 
                                fontWeight: 500,
                                fontSize: '0.8rem'
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            name="lastName"
                            label="Tên *"
                            value={form.lastName}
                            onChange={handleChange}
                            required
                            placeholder="Ví dụ: Văn A"
                            helperText="Nhập tên của bạn (bắt buộc)"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
                                '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                '&:hover fieldset': { borderColor: 'white' },
                                '&.Mui-focused fieldset': { borderColor: 'white' }
                              },
                              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)', fontWeight: 600 },
                              '& .MuiInputLabel-root.Mui-focused': { color: 'white', fontWeight: 600 },
                              '& .MuiInputBase-input': { color: '#333', fontWeight: 500 },
                              '& .MuiFormHelperText-root': { 
                                color: 'rgba(255,255,255,0.8)', 
                                fontWeight: 500,
                                fontSize: '0.8rem'
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                      
                      <TextField
                        fullWidth
                        name="email"
                        label="Email *"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="Ví dụ: nguyenvana@gmail.com"
                        helperText="Nhập email để nhận mã xác nhận (bắt buộc)"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'white',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                            '&:hover fieldset': { borderColor: 'white' },
                            '&.Mui-focused fieldset': { borderColor: 'white' }
                          },
                          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)', fontWeight: 600 },
                          '& .MuiInputLabel-root.Mui-focused': { color: 'white', fontWeight: 600 },
                          '& .MuiInputBase-input': { color: '#333', fontWeight: 500 },
                          '& .MuiFormHelperText-root': { 
                            color: 'rgba(255,255,255,0.8)', 
                            fontWeight: 500,
                            fontSize: '0.8rem'
                          }
                        }}
                      />
                      
                      <TextField
                        fullWidth
                        name="phoneNumber"
                        label="Số điện thoại"
                        value={form.phoneNumber}
                        onChange={handleChange}
                        placeholder="Ví dụ: 0123456789"
                        helperText="Nhập số điện thoại (không bắt buộc)"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'white',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                            '&:hover fieldset': { borderColor: 'white' },
                            '&.Mui-focused fieldset': { borderColor: 'white' }
                          },
                          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)', fontWeight: 600 },
                          '& .MuiInputLabel-root.Mui-focused': { color: 'white', fontWeight: 600 },
                          '& .MuiInputBase-input': { color: '#333', fontWeight: 500 },
                          '& .MuiFormHelperText-root': { 
                            color: 'rgba(255,255,255,0.8)', 
                            fontWeight: 500,
                            fontSize: '0.8rem'
                          }
                        }}
                      />
                    </Stack>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  p: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                  borderRadius: 2,
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
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        mr: 1.5, 
                        p: 1, 
                        borderRadius: '50%', 
                        bgcolor: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <SecurityIcon sx={{ fontSize: 20, color: 'white' }} />
                      </Box>
                      <Typography variant="h6" fontWeight={600}>
                        Bảo mật tài khoản
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255,255,255,0.8)', 
                      mb: 2, 
                      fontSize: '0.8rem',
                      fontStyle: 'italic'
                    }}>
                      💡 Nhấn vào biểu tượng mắt để hiện/ẩn mật khẩu
                    </Typography>
                    
                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        name="password"
                        label="Mật khẩu *"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        required
                        placeholder="Ví dụ: MatKhau123@"
                        helperText="Tạo mật khẩu tối thiểu 6 ký tự (bắt buộc)"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                sx={{ 
                                  color: 'rgba(255,255,255,0.8)',
                                  '&:hover': {
                                    color: 'white',
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    borderRadius: '50%'
                                  }
                                }}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'white',
                            '& fieldset': { 
                              borderColor: form.password && form.confirmPassword && form.password !== form.confirmPassword ? '#ff6b6b' : 'rgba(255,255,255,0.3)' 
                            },
                            '&:hover fieldset': { 
                              borderColor: form.password && form.confirmPassword && form.password !== form.confirmPassword ? '#ff6b6b' : 'white' 
                            },
                            '&.Mui-focused fieldset': { 
                              borderColor: form.password && form.confirmPassword && form.password !== form.confirmPassword ? '#ff6b6b' : 'white' 
                            }
                          },
                          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)', fontWeight: 600 },
                          '& .MuiInputLabel-root.Mui-focused': { color: 'white', fontWeight: 600 },
                          '& .MuiInputBase-input': { color: '#333', fontWeight: 500 },
                          '& .MuiFormHelperText-root': { 
                            color: 'rgba(255,255,255,0.8)', 
                            fontWeight: 500,
                            fontSize: '0.8rem'
                          }
                        }}
                      />
                      
                      <TextField
                        fullWidth
                        name="confirmPassword"
                        label="Xác nhận mật khẩu *"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="Nhập lại mật khẩu ở trên"
                        helperText="Nhập lại mật khẩu để xác nhận (bắt buộc)"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                                aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                sx={{ 
                                  color: 'rgba(255,255,255,0.8)',
                                  '&:hover': {
                                    color: 'white',
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    borderRadius: '50%'
                                  }
                                }}
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'white',
                            '& fieldset': { 
                              borderColor: form.password && form.confirmPassword && form.password !== form.confirmPassword ? '#ff6b6b' : 'rgba(255,255,255,0.3)' 
                            },
                            '&:hover fieldset': { 
                              borderColor: form.password && form.confirmPassword && form.password !== form.confirmPassword ? '#ff6b6b' : 'white' 
                            },
                            '&.Mui-focused fieldset': { 
                              borderColor: form.password && form.confirmPassword && form.password !== form.confirmPassword ? '#ff6b6b' : 'white' 
                            }
                          },
                          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)', fontWeight: 600 },
                          '& .MuiInputLabel-root.Mui-focused': { color: 'white', fontWeight: 600 },
                          '& .MuiInputBase-input': { color: '#333', fontWeight: 500 },
                          '& .MuiFormHelperText-root': { 
                            color: 'rgba(255,255,255,0.8)', 
                            fontWeight: 500,
                            fontSize: '0.8rem'
                          }
                        }}
                      />
                      
                      {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
                        <Alert severity="error" sx={{ 
                          bgcolor: 'rgba(255,107,107,0.1)', 
                          color: '#ff6b6b',
                          border: '1px solid #ff6b6b'
                        }}>
                          ⚠️ Mật khẩu xác nhận không khớp
                        </Alert>
                      )}
                      
                      {form.password && form.password.length < 6 && (
                        <Alert severity="warning" sx={{ 
                          bgcolor: 'rgba(255,193,7,0.1)', 
                          color: '#f57c00',
                          border: '1px solid #f57c00'
                        }}>
                          💡 Mật khẩu phải có ít nhất 6 ký tự
                        </Alert>
                      )}
                    </Stack>
                  </Box>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: 3
            }}>
              <Button
                variant="contained"
                onClick={handleRegister}
                disabled={!form.firstName || !form.lastName || !form.email || !form.password || !form.confirmPassword || form.password !== form.confirmPassword || loading}
                size="large"
                sx={{ 
                  px: 6, 
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  minWidth: 200,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                  color: 'white',
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                  },
                  '&:disabled': {
                    background: '#e0e0e0',
                    color: '#757575',
                    boxShadow: 'none',
                    transform: 'none'
                  }
                }}
              >
                {loading ? 'Đang xử lý...' : 'ĐĂNG KÝ'}
              </Button>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ 
              mb: 3, 
              textAlign: 'center', 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Xác nhận email
            </Typography>
            
            <Card sx={{ 
              p: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
              maxWidth: 500,
              mx: 'auto',
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
              <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                <Box sx={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2,
                  p: 2,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.2)'
                }}>
                  <EmailIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Kiểm tra email của bạn
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                  Chúng tôi đã gửi mã xác nhận 6 chữ số đến email <strong>{form.email}</strong>
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mb: 3, fontSize: '0.9rem' }}>
                  Vui lòng kiểm tra hộp thư và nhập mã bên dưới để hoàn tất đăng ký
                </Typography>
                
                <TextField
                  fullWidth
                  label="Mã xác nhận *"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  placeholder="Nhập mã 6 chữ số"
                  helperText="Nhập chính xác mã 6 chữ số từ email (bắt buộc)"
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: 'white' },
                      '&.Mui-focused fieldset': { borderColor: 'white' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)', fontWeight: 600 },
                    '& .MuiInputLabel-root.Mui-focused': { color: 'white', fontWeight: 600 },
                    '& .MuiInputBase-input': { color: '#333', fontWeight: 500 },
                    '& .MuiFormHelperText-root': { 
                      color: 'rgba(255,255,255,0.8)', 
                      fontWeight: 500,
                      fontSize: '0.8rem'
                    }
                  }}
                />
                
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                    Không nhận được mã?
                  </Typography>
                  <Button
                    onClick={handleResendCode}
                    disabled={loading}
                    sx={{ 
                      color: 'white', 
                      textDecoration: 'underline',
                      '&:hover': { textDecoration: 'none' }
                    }}
                  >
                    Gửi lại mã
                  </Button>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  gap: 2
                }}>
                  <Button 
                    onClick={() => setActiveStep(0)}
                    variant="outlined"
                    size="large"
                    sx={{ 
                      px: 3, 
                      py: 1,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: 'white',
                      borderColor: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    Quay lại
                  </Button>
                  
                  <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={loading || code.length !== 6}
                    size="large"
                    sx={{ 
                      px: 3, 
                      py: 1,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                      boxShadow: '0 3px 10px rgba(76, 175, 80, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
                      },
                      '&:disabled': {
                        background: '#e0e0e0',
                        color: '#757575',
                        boxShadow: 'none',
                        transform: 'none'
                      }
                    }}
                  >
                    {loading ? 'Đang xử lý...' : 'Xác nhận'}
                  </Button>
                </Box>
              </Box>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        padding: 0,
        '& *': {
          boxSizing: 'border-box'
        }
      }}
    >
      <Paper
        elevation={24}
        sx={{
          width: { xs: '95vw', sm: 900, md: 1000 },
          maxWidth: 1200,
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
        <Box sx={{ flexShrink: 0, mb: 2 }}>
          <Box textAlign="center" mb={2}>
            <Typography variant="h3" fontWeight={800} gutterBottom sx={{
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Đăng ký Customer
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
              Tạo tài khoản để trải nghiệm dịch vụ tốt nhất
            </Typography>
            
            <Stepper activeStep={activeStep} sx={{ 
              mb: 2,
              '& .MuiStepLabel-root': {
                '& .MuiStepLabel-label': {
                  fontSize: '0.9rem',
                  fontWeight: 600
                }
              }
            }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
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
        <Box sx={{ 
          flex: 1, 
          px: 1
        }}>
          {renderStepContent(activeStep)}
        </Box>
      </Paper>
    </Box>
  );
};

export default Register; 