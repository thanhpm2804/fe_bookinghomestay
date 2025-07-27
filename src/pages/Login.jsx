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
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

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
      // Sử dụng AuthContext để lưu thông tin đăng nhập
      login(data.user || { email }, data.token);
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
    const idToken = credentialResponse.credential;
    const response = await fetch('/api/Account/google-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      navigate('/home');
    } else {
      alert('Google login failed!');
    }
  };
  const handleGoogleError = () => {
    alert('Google login was unsuccessful. Try again later');
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
        elevation={16}
        sx={{
          width: '100vw',
          height: '100vh',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 16px 64px 0 rgba(31, 38, 135, 0.25)',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(8px)',
          border: '4px solid',
          borderImage: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%) 1',
          position: 'relative',
          zIndex: 1,
        }}
        role="form"
        aria-labelledby="login-title"
      >
        <Stack alignItems="center" spacing={3} mb={5}>
          <Box
            sx={{
              bgcolor: 'linear-gradient(135deg, #1976d2 0%, #a1c4fd 100%)',
              borderRadius: '50%',
              p: 2.5,
              mb: 1,
              boxShadow: '0 4px 24px 0 rgba(25, 118, 210, 0.18)',
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
              borderRadius: 2,
              fontSize: 22,
              boxShadow: '0 2px 8px 0 rgba(25, 118, 210, 0.08)',
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
              borderRadius: 2,
              fontSize: 22,
              boxShadow: '0 2px 8px 0 rgba(25, 118, 210, 0.08)',
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
              borderRadius: 2,
              background: 'linear-gradient(90deg, #1976d2 0%, #a1c4fd 100%)',
              boxShadow: '0 4px 16px rgba(25, 118, 210, 0.15)',
              textTransform: 'none',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(25, 118, 210, 0.25)',
              },
            }}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>
        <Divider sx={{ my: 3, width: '100%', maxWidth: 420 }}>hoặc</Divider>
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
            href="/register"
            underline="hover"
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, fontWeight: 500 }}
          >
            Đăng ký
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