import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Link,
  Stack,
  Alert,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Divider
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState('customer'); // Thêm lựa chọn loại tài khoản
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/Account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
        // Nếu không parse được JSON, giữ data rỗng
      }
      if (!res.ok) {
        setError(data.message || 'Đăng nhập thất bại! Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.');
        setIsLoading(false);
        return;
      }
      localStorage.setItem('token', data.token);
      setIsLoading(false);
      navigate('/home');
    } catch (err) {
      setError('Lỗi kết nối server!\\nCó thể do CORS hoặc chứng chỉ HTTPS tự ký. Hãy chắc chắn backend cho phép truy cập từ FE và trình duyệt đã chấp nhận chứng chỉ.');
      setIsLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Xử lý đăng nhập Google
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;
      console.log('Google login attempt with idToken:', idToken.substring(0, 50) + '...');
      
      const response = await fetch('/api/Account/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      
      console.log('Google login response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Google login success, data:', data);
        localStorage.setItem('token', data.token);
        
        // Parse JWT để lấy role
        const decoded = parseJwt(data.token);
        const role = decoded && (decoded.role || (decoded.roles && decoded.roles[0]));
        
        if (role === 'Admin') {
          navigate('/admin');
        } else if (role === 'Manager') {
          navigate('/manager');
        } else {
          navigate('/home');
        }
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: 'Google login failed!' };
        }
        console.error('Google login failed:', errorData);
        
        // Nếu user chưa tồn tại, tự động đăng ký
        if (response.status === 404 || errorData.message?.includes('not found') || errorData.message?.includes('not exist')) {
          console.log('User not found, attempting auto-registration...');
          await handleAutoRegisterCustomer(credentialResponse);
        } else {
          setError(errorData.message || 'Google login failed!');
        }
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Lỗi kết nối server khi đăng nhập Google!');
    }
  };
  
  const handleGoogleError = (error) => {
    console.error('Google OAuth error:', error);
    if (error.error === 'popup_closed_by_user') {
      setError('Đăng nhập Google bị hủy. Vui lòng thử lại.');
    } else if (error.error === 'access_denied') {
      setError('Quyền truy cập bị từ chối. Vui lòng thử lại.');
    } else {
      setError('Lỗi đăng nhập Google. Vui lòng thử lại sau.');
    }
  };

  // Tự động đăng ký customer khi Google login thất bại
  const handleAutoRegisterCustomer = async (credentialResponse) => {
    try {
      console.log('Auto-registering customer with Google credentials...');
      
      const response = await fetch('/api/Account/register-customer-with-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          idToken: credentialResponse.credential,
          accountType: 'customer'
        }),
      });
      
      console.log('Auto-registration response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Auto-registration success:', data);
        localStorage.setItem('token', data.token);
        
        // Parse JWT để lấy role
        const decoded = parseJwt(data.token);
        const role = decoded && (decoded.role || (decoded.roles && decoded.roles[0]));
        
        setMessage('Đăng ký thành công! Chào mừng bạn đến với hệ thống.');
        
        if (role === 'Admin') {
          navigate('/admin');
        } else if (role === 'Manager') {
          navigate('/manager');
        } else {
          navigate('/home');
        }
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: 'Auto-registration failed!' };
        }
        console.error('Auto-registration failed:', errorData);
        setError(errorData.message || 'Không thể tự động đăng ký. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Auto-registration error:', err);
      setError('Lỗi kết nối server khi tự động đăng ký!');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        minWidth: '100vw',
        p: 0,
        m: 0,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #b6ccfe 0%, #e0c3fc 50%, #a1c4fd 100%)',
      }}
      role="main"
    >
      <Paper
        elevation={24}
        sx={{
          width: { xs: '95vw', sm: 440 },
          maxWidth: 480,
          borderRadius: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 40px 0 rgba(31, 38, 135, 0.18)',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(10px)',
          border: '3px solid',
          borderImage: 'linear-gradient(135deg, #1976d2 0%, #a1c4fd 100%) 1',
          position: 'relative',
          zIndex: 1,
          px: { xs: 2, sm: 4 },
          py: { xs: 3, sm: 5 },
        }}
        role="form"
        aria-labelledby="login-title"
      >
        <Stack alignItems="center" spacing={3} mb={4}>
          <Box
            sx={{
              bgcolor: 'linear-gradient(135deg, #1976d2 0%, #a1c4fd 100%)',
              borderRadius: '50%',
              p: 2.5,
              mb: 1,
              boxShadow: '0 4px 24px 0 rgba(25, 118, 210, 0.18)',
              border: '2.5px solid #a1c4fd',
            }}
          >
            <LockOutlinedIcon sx={{ color: 'white', fontSize: 56 }} />
          </Box>
          <Typography
            id="login-title"
            variant="h2"
            fontWeight={800}
            color="#1976d2"
            letterSpacing={2}
            sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
          >
            Đăng nhập
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={500}>
            Chào mừng bạn quay trở lại!
          </Typography>
          <Stack direction="row" spacing={2} mt={1}>
            <Button
              variant={accountType === 'customer' ? 'contained' : 'outlined'}
              onClick={() => setAccountType('customer')}
              sx={{ fontWeight: 600 }}
            >
              Customer
            </Button>
            <Button
              variant={accountType === 'owner' ? 'contained' : 'outlined'}
              onClick={() => setAccountType('owner')}
              sx={{ fontWeight: 600 }}
            >
              Owner
            </Button>
          </Stack>
        </Stack>
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, width: '100%', maxWidth: 420, fontSize: 18 }}
            role="alert"
          >
            {error}
          </Alert>
        )}
        {message && (
          <Alert
            severity="success"
            sx={{ mb: 3, width: '100%', maxWidth: 420, fontSize: 18 }}
            role="alert"
          >
            {message}
          </Alert>
        )}
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 420 }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            aria-describedby="email-error"
            sx={{
              bgcolor: 'white',
              borderRadius: 3,
              fontSize: 22,
              boxShadow: '0 2px 12px 0 rgba(25, 118, 210, 0.10)',
              border: '2px solid #a1c4fd',
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                '& fieldset': {
                  borderColor: '#a1c4fd',
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: '#1976d2',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1976d2',
                  borderWidth: 2.5,
                },
              },
            }}
            InputProps={{ style: { fontSize: 22, height: 64, fontWeight: 500 } }}
            InputLabelProps={{ style: { fontSize: 20 } }}
          />
          <TextField
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            aria-describedby="password-error"
            sx={{
              bgcolor: 'white',
              borderRadius: 3,
              fontSize: 22,
              boxShadow: '0 2px 12px 0 rgba(25, 118, 210, 0.10)',
              border: '2px solid #a1c4fd',
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                '& fieldset': {
                  borderColor: '#a1c4fd',
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: '#1976d2',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1976d2',
                  borderWidth: 2.5,
                },
              },
            }}
            InputProps={{
              style: { fontSize: 22, height: 64, fontWeight: 500 },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    onClick={handleTogglePassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            InputLabelProps={{ style: { fontSize: 20 } }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                color="primary"
              />
            }
            label="Ghi nhớ đăng nhập"
            sx={{ mt: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{
              mt: 3,
              py: 1.5,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              fontWeight: 600,
              borderRadius: 3,
              background: 'linear-gradient(90deg, #1976d2 0%, #a1c4fd 100%)',
              boxShadow: '0 4px 16px rgba(25, 118, 210, 0.18)',
              textTransform: 'none',
              border: '2.5px solid #a1c4fd',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px) scale(1.03)',
                boxShadow: '0 6px 24px rgba(25, 118, 210, 0.25)',
                background: 'linear-gradient(90deg, #1976d2 0%, #67e8f9 100%)',
                borderColor: '#1976d2',
              },
            }}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>
        <Divider sx={{ my: 3, width: '100%', maxWidth: 420, fontWeight: 700, color: '#1976d2' }}>hoặc</Divider>
        <div style={{ margin: '24px 0', textAlign: 'center' }}>
          <GoogleLogin
            onSuccess={credentialResponse => {
              const idToken = credentialResponse.credential;
              fetch('/api/Account/google-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken })
              })
              .then(res => res.json())
              .then(data => {
                // Lưu JWT, chuyển hướng, v.v.
                localStorage.setItem('token', data.token);
                window.location.href = '/home';
              })
              .catch(() => alert('Google login failed!'));
            }}
            onError={() => {
              alert('Google login error!');
            }}
          />
        </div>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          mt={3}
          width="100%"
          maxWidth={420}
          spacing={1}
        >
          <Link
            href={accountType === 'customer' ? "/register" : "/register-owner"}
            underline="hover"
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, fontWeight: 500 }}
          >
            Đăng ký {accountType === 'customer' ? 'Customer' : 'Owner'}
          </Link>
          <Link
            href="/forgot-password"
            underline="hover"
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, fontWeight: 500 }}
          >
            Quên mật khẩu?
          </Link>
        </Stack>
      </Paper>
    </Box>
  );
}
export default Login;