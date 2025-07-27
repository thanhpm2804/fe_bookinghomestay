import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  InputAdornment,
  IconButton,
  Card,
  CardMedia,
  Chip,
  CardContent
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import SecurityIcon from '@mui/icons-material/Security';
import WorkIcon from '@mui/icons-material/Work';
import { useNavigate } from 'react-router-dom';
import { uploadMultipleImages } from '../services/cloudinaryService';

function RegisterOwner() {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    gender: '',
    dateOfBirth: '',
    businessName: '',
    businessType: '',
    experience: ''
  });
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [images, setImages] = useState([]); // Lưu mảng base64 ảnh (tạm thời)
  const [imageFiles, setImageFiles] = useState([]); // Lưu file ảnh gốc để preview
  const [imageUrls, setImageUrls] = useState([]); // Lưu URLs từ Cloudinary
  const [uploadingImages, setUploadingImages] = useState(false); // Loading khi upload
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const steps = ['Thông tin cá nhân', 'Thông tin Homestay', 'Xác nhận email'];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Xử lý chọn ảnh và upload lên Cloudinary
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setUploadingImages(true);

    try {
      // Upload lên Cloudinary thật
      const urls = await uploadMultipleImages(files);
      setImageUrls(urls);

      // Convert to base64 cho preview
      Promise.all(files.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      })).then(base64Arr => {
        setImages(base64Arr);
      });

      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Upload failed:', error);
      setError(`Upload ảnh thất bại: ${error.message}. 
      
      🔧 Nếu vẫn lỗi, hãy kiểm tra:
      1. Cloudinary preset 'homestay_upload' đã được tạo
      2. API key và cloud name đúng
      3. Preset có quyền upload`);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newImages = images.filter((_, i) => i !== index);
    const newImageUrls = imageUrls.filter((_, i) => i !== index); // Also remove URL
    setImageFiles(newFiles);
    setImages(newImages);
    setImageUrls(newImageUrls);
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    // Validate password
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/account/create-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          phoneNumber: form.phoneNumber,
          address: form.address,
          gender: form.gender,
          dateOfBirth: form.dateOfBirth,
          // Gửi URLs từ Cloudinary thay vì base64
          avatarUrl: imageUrls.length > 0 ? imageUrls[0] : undefined, // Ảnh đại diện
          homestayImageUrls: imageUrls // Mảng URLs ảnh homestay
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Đăng ký thất bại!');
      } else {
        setMessage('Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác nhận.');
        setActiveStep(2);
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('Lỗi kết nối server!');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    console.log('Sending confirmation request:', { email: form.email, code });
    
    try {
      // Thử với các endpoint khác nhau
      const endpoints = [
        '/api/account/confirm-owner-registration',
        '/api/Account/confirm-owner-registration', 
        '/api/owner/confirm-registration',
        '/api/Account/confirm-registration'
      ];
      
      let res;
      let lastError;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: form.email, code }),
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
      
      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);
      
      let data;
      const responseText = await res.text();
      console.log('Raw response:', responseText);
      
      try {
        data = JSON.parse(responseText);
        console.log('Response data:', data);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        data = { message: responseText };
      }
      
      if (!res.ok) {
        setError(data.message || `Xác nhận thất bại! Status: ${res.status}`);
      } else {
        setMessage('Xác nhận thành công! Chuyển hướng đến trang chủ...');
        setTimeout(() => navigate('/home'), 2000);
      }
    } catch (err) {
      console.error('Confirm error:', err);
      setError(`Lỗi kết nối server! Chi tiết: ${err.message}. Vui lòng kiểm tra backend có đang chạy không.`);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await fetch('/api/account/resend-confirmation-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      
      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      
      if (res.ok) {
        setMessage('Mã xác nhận mới đã được gửi đến email của bạn!');
      } else {
        setError(data.message || 'Không thể gửi lại mã. Vui lòng thử lại sau.');
      }
    } catch (err) {
      console.error('Resend error:', err);
      setError('Lỗi kết nối server! Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 4, fontWeight: 600, textAlign: 'center', color: 'primary.main' }}>
              👤 Thông tin cá nhân
            </Typography>
            
            <Grid container spacing={4}>
              {/* Thông tin cơ bản */}
              <Grid item xs={12}>
                <Card sx={{ p: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <BusinessIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                    <Typography variant="h6" fontWeight={600}>
                      Thông tin cơ bản
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Họ"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        placeholder="Nhập họ của bạn"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Tên"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        placeholder="Nhập tên của bạn"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        placeholder="example@email.com"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Số điện thoại"
                        name="phoneNumber"
                        value={form.phoneNumber}
                        onChange={handleChange}
                        variant="outlined"
                        placeholder="0123456789"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Địa chỉ"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        variant="outlined"
                        placeholder="Nhập địa chỉ của bạn"
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Giới tính</InputLabel>
                        <Select
                          name="gender"
                          value={form.gender}
                          onChange={handleChange}
                          label="Giới tính"
                        >
                          <MenuItem value={0}>Nam</MenuItem>
                          <MenuItem value={1}>Nữ</MenuItem>
                          <MenuItem value={2}>Khác</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Ngày sinh"
                        name="dateOfBirth"
                        type="date"
                        value={form.dateOfBirth}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 6 }}>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!form.firstName || !form.lastName || !form.email}
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  minWidth: 120,
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 15px 2px rgba(25, 118, 210, .4)',
                  }
                }}
              >
                Tiếp tục →
              </Button>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box component="form" onSubmit={handleRegister}>
            <Typography variant="h5" gutterBottom sx={{ mb: 4, fontWeight: 600, textAlign: 'center', color: 'primary.main' }}>
              🏢 Thông tin Homestay
            </Typography>
            
            <Grid container spacing={3}>
              {/* Thông tin cơ bản */}
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 3, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <BusinessIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                    <Typography variant="h6" fontWeight={600}>
                      Thông tin cơ bản
                    </Typography>
                  </Box>
                  
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Tên homestay"
                      name="businessName"
                      value={form.businessName}
                      onChange={handleChange}
                      variant="outlined"
                      placeholder="Nhập tên doanh nghiệp của bạn"
                    />
                    
                    <FormControl fullWidth>
                      <InputLabel>Loại hình kinh doanh</InputLabel>
                      <Select
                        name="businessType"
                        value={form.businessType}
                        onChange={handleChange}
                        label="Loại hình kinh doanh"
                        defaultValue="homestay"
                      >
                        <MenuItem value="homestay">Homestay</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <TextField
                      fullWidth
                      label="Kinh nghiệm trong ngành (năm)"
                      name="experience"
                      type="number"
                      value={form.experience}
                      onChange={handleChange}
                      variant="outlined"
                      placeholder="Số năm kinh nghiệm"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">năm</InputAdornment>,
                      }}
                    />
                  </Stack>
                </Card>
              </Grid>

              {/* Bảo mật tài khoản */}
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 3, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <SecurityIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                    <Typography variant="h6" fontWeight={600}>
                      Bảo mật tài khoản
                    </Typography>
                  </Box>
                  
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Mật khẩu"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      placeholder="Tối thiểu 6 ký tự"
                      InputProps={{
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
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: form.password && form.confirmPassword && form.password !== form.confirmPassword ? '#d32f2f' : '#e0e0e0',
                          },
                          '&:hover fieldset': {
                            borderColor: form.password && form.confirmPassword && form.password !== form.confirmPassword ? '#d32f2f' : '#1976d2',
                          },
                        },
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Xác nhận mật khẩu"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      placeholder="Nhập lại mật khẩu"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                              onClick={handleToggleConfirmPassword}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: form.password && form.confirmPassword && form.password !== form.confirmPassword ? '#d32f2f' : '#e0e0e0',
                          },
                          '&:hover fieldset': {
                            borderColor: form.password && form.confirmPassword && form.password !== form.confirmPassword ? '#d32f2f' : '#1976d2',
                          },
                        },
                      }}
                    />
                    
                    {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        Mật khẩu xác nhận không khớp
                      </Alert>
                    )}
                  </Stack>
                </Card>
              </Grid>

              {/* Upload ảnh */}
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 3, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <WorkIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                    <Typography variant="h6" fontWeight={600}>
                      📸 Ảnh homestay (tùy chọn)
                    </Typography>
                  </Box>
                  
                  <Box
                    sx={{
                      border: '2px dashed #e0e0e0',
                      borderRadius: 3,
                      p: 2,
                      textAlign: 'center',
                      bgcolor: '#fafafa',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#1976d2',
                        bgcolor: '#f5f5f5',
                      },
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      id="homestay-images"
                      onChange={handleImageChange}
                      disabled={uploadingImages}
                    />
                    <label htmlFor="homestay-images">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={uploadingImages ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                        disabled={uploadingImages}
                        sx={{
                          mb: 1,
                          py: 1,
                          px: 2,
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          borderWidth: 2,
                          '&:hover': {
                            borderWidth: 2,
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                          },
                        }}
                      >
                        {uploadingImages ? 'Đang upload...' : 'Chọn ảnh'}
                      </Button>
                    </label>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      {uploadingImages ? 'Đang upload...' : 'JPG, PNG, GIF'}
                    </Typography>
                  </Box>

                  {imageFiles.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                        Ảnh đã chọn ({imageFiles.length})
                      </Typography>
                      <Grid container spacing={1}>
                        {imageFiles.map((file, idx) => (
                          <Grid item xs={6} key={idx}>
                            <Card
                              sx={{
                                position: 'relative',
                                borderRadius: 1,
                                overflow: 'hidden',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                },
                              }}
                            >
                              <CardMedia
                                component="img"
                                height="80"
                                image={URL.createObjectURL(file)}
                                alt={`homestay-${idx}`}
                                sx={{ objectFit: 'cover' }}
                              />
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 2,
                                  right: 2,
                                  bgcolor: 'rgba(0,0,0,0.7)',
                                  borderRadius: '50%',
                                  p: 0.5,
                                }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveImage(idx)}
                                  sx={{ color: 'white', p: 0.5 }}
                                >
                                  <DeleteIcon sx={{ fontSize: '0.8rem' }} />
                                </IconButton>
                              </Box>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mt: 9,
              mb: 2,
              px: { xs: 1, sm: 0 },
              position: 'sticky',
              bottom: 0,
              bgcolor: 'transparent',
              zIndex: 10
            }}>
              <Button 
                onClick={handleBack}
                variant="outlined"
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  borderWidth: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  minWidth: 120,
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }
                }}
              >
                ← Quay lại
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !form.password || !form.confirmPassword || form.password !== form.confirmPassword}
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  minWidth: 120,
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 15px 2px rgba(25, 118, 210, .4)',
                  },
                  '&:disabled': {
                    background: '#e0e0e0',
                    color: '#757575',
                    boxShadow: 'none',
                    transform: 'none'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Đăng ký →'}
              </Button>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box component="form" onSubmit={handleConfirm}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              Xác nhận email
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Chúng tôi đã gửi mã xác nhận 6 chữ số đến email <strong>{form.email}</strong>. 
              Vui lòng kiểm tra hộp thư và nhập mã bên dưới.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mã xác nhận"
                  name="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  maxLength={6}
                  variant="outlined"
                  inputProps={{ maxLength: 6 }}
                  placeholder="Nhập mã 6 chữ số"
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Không nhận được mã?
              </Typography>
              <Button
                variant="text"
                onClick={handleResendCode}
                disabled={loading}
                sx={{
                  color: 'primary.main',
                  textDecoration: 'underline',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'none',
                  },
                }}
              >
                {loading ? 'Đang gửi...' : 'Gửi lại mã xác nhận'}
              </Button>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mt: 6,
              mb: 2,
              px: { xs: 1, sm: 0 },
              position: 'sticky',
              bottom: 0,
              bgcolor: 'transparent',
              zIndex: 10
            }}>
              <Button 
                onClick={handleBack}
                variant="outlined"
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  borderWidth: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  minWidth: 120,
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }
                }}
              >
                ← Quay lại
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || code.length !== 6}
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  minWidth: 120,
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 15px 2px rgba(25, 118, 210, .4)',
                  },
                  '&:disabled': {
                    background: '#e0e0e0',
                    color: '#757575',
                    boxShadow: 'none',
                    transform: 'none'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Xác nhận →'}
              </Button>
            </Box>
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
        minWidth: '100vw',
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 0,
        m: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000
      }}
    >
      <Paper
        elevation={24}
        sx={{
          width: { xs: '95vw', sm: 900, md: 1100, lg: 1200 },
          maxWidth: 1400,
          height: { xs: '92vh', sm: '90vh', md: '85vh' },
          minHeight: { xs: '92vh', sm: '90vh', md: '85vh' },
          borderRadius: { xs: 4, sm: 7 },
          p: { xs: 2, sm: 4, md: 5 },
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 40px 0 rgba(31, 38, 135, 0.18), 0 1.5px 8px 0 rgba(102,126,234,0.10)',
          border: '3px solid',
          borderImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1',
          transition: 'box-shadow 0.2s, border-color 0.2s',
          '&:hover': {
            boxShadow: '0 12px 48px 0 rgba(102,126,234,0.22), 0 2px 12px 0 rgba(118,75,162,0.12)',
            borderColor: '#764ba2',
          },
          overflow: 'hidden', // Ngăn nội dung tràn ra ngoài
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <Box sx={{ flexShrink: 0, p: { xs: 1, sm: 2 } }}>
            <Box textAlign="center" mb={2}>
              <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                Đăng ký Owner
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Trở thành đối tác của chúng tôi và bắt đầu kinh doanh homestay
              </Typography>
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Alerts */}
          <Box sx={{ flexShrink: 0, px: { xs: 1, sm: 2 } }}>
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
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'auto',
            px: { xs: 1, sm: 2 },
            pb: { xs: 1, sm: 2 }
          }}>
            {renderStepContent(activeStep)}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default RegisterOwner; 