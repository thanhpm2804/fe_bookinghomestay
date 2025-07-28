import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Avatar,
  Divider,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  IconButton,
  InputAdornment
} from '@mui/material';
import Toolbar from '../components/Toolbar';
import Footer from '../components/Footer';
import { Edit, Lock, Visibility, VisibilityOff, Save, Cancel } from '@mui/icons-material';

const genderOptions = [
  { value: 0, label: 'Khác' },
  { value: 1, label: 'Nam' },
  { value: 2, label: 'Nữ' },
];

function Profile() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    gender: 0,
    dateOfBirth: '',
    phoneNumber: '',
    address: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({ 
    currentPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProfile();
    // eslint-disable-next-line
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/Users/profile', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Không thể lấy thông tin người dùng.');
      const data = await res.json();
      setProfile(data.user);
      setEditData({
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || '',
        phoneNumber: data.user.phoneNumber || '',
        address: data.user.address || '',
        dateOfBirth: data.user.dateOfBirth ? data.user.dateOfBirth.substring(0, 10) : '',
        gender: typeof data.user.gender === 'number' ? data.user.gender : 0
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/Users/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          Id: profile?.id,
          FirstName: editData.firstName,
          LastName: editData.lastName,
          PhoneNumber: editData.phoneNumber,
          Address: editData.address,
          DateOfBirth: editData.dateOfBirth,
          Gender: Number(editData.gender)
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Cập nhật thông tin thất bại.');
        return;
      }
      setSuccess(data.message || 'Cập nhật thông tin thành công!');
      setEditMode(false);
      await fetchProfile();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOpenPasswordDialog = () => {
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
    setPasswordSuccess('');
    setOpenPasswordDialog(true);
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleClickShowPassword = (field) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
  };

  const handleChangePassword = async () => {
    setPasswordError(''); 
    setPasswordSuccess('');
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Mật khẩu mới và xác nhận không khớp.');
      return;
    }
    try {
      const res = await fetch('/api/Users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData || 'Đổi mật khẩu thất bại.');
      }
      setPasswordSuccess('Đổi mật khẩu thành công!');
      setTimeout(() => setOpenPasswordDialog(false), 1500);
    } catch (err) {
      setPasswordError(err.message);
    }
  };

  if (loading) return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Toolbar />
      <Box sx={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Typography variant="h6" color="text.secondary">
          Đang tải thông tin...
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Toolbar />
      
      <Box sx={{
        flex: 1,
        p: { xs: 2, md: 4 },
        maxWidth: 800,
        mx: 'auto',
        width: '100%'
      }}>
        <Paper elevation={3} sx={{ 
          p: { xs: 2, md: 4 },
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <Stack spacing={4}>
            {/* Header Section */}
            <Box sx={{ 
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              gap: 3
            }}>
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120, 
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem',
                  boxShadow: 3
                }}
                src={profile?.avatarUrl || undefined}
              >
                {profile?.firstName?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              
              <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  {profile?.firstName} {profile?.lastName}
                </Typography>
                <Typography variant="body1" color="text.secondary" mt={1}>
                  {profile?.email}
                </Typography>
                
                {!editMode && (
                  <Stack direction="row" spacing={2} mt={3}>
                    <Button 
                      variant="contained" 
                      startIcon={<Edit />}
                      onClick={() => setEditMode(true)}
                      sx={{ borderRadius: 2 }}
                    >
                      Chỉnh sửa
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<Lock />}
                      onClick={handleOpenPasswordDialog}
                      sx={{ borderRadius: 2 }}
                    >
                      Đổi mật khẩu
                    </Button>
                  </Stack>
                )}
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Alerts */}
            {(error || success) && (
              <Alert severity={error ? 'error' : 'success'} sx={{ mb: 2 }}>
                {error || success}
              </Alert>
            )}
            
            {/* Profile Content */}
            {!editMode ? (
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 3
              }}>
                <Stack spacing={2}>
                  <Typography variant="subtitle1" color="text.secondary">THÔNG TIN CÁ NHÂN</Typography>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Họ và tên</Typography>
                    <Typography variant="body1">{profile?.firstName} {profile?.lastName}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Giới tính</Typography>
                    <Typography variant="body1">{genderOptions.find(g => g.value === profile?.gender)?.label || 'Khác'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Ngày sinh</Typography>
                    <Typography variant="body1">{profile?.dateOfBirth || 'Chưa cập nhật'}</Typography>
                  </Box>
                </Stack>
                
                <Stack spacing={2}>
                  <Typography variant="subtitle1" color="text.secondary">THÔNG TIN LIÊN HỆ</Typography>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Số điện thoại</Typography>
                    <Typography variant="body1">{profile?.phoneNumber || 'Chưa cập nhật'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Địa chỉ</Typography>
                    <Typography variant="body1">{profile?.address || 'Chưa cập nhật'}</Typography>
                  </Box>
                </Stack>
              </Box>
            ) : (
              <Stack spacing={3}>
                <Typography variant="subtitle1" color="text.secondary">CHỈNH SỬA THÔNG TIN</Typography>
                
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 3
                }}>
                  <TextField 
                    label="Họ" 
                    name="firstName" 
                    value={editData.firstName} 
                    onChange={handleEditChange} 
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                  <TextField 
                    label="Tên" 
                    name="lastName" 
                    value={editData.lastName} 
                    onChange={handleEditChange} 
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                  <TextField 
                    label="Số điện thoại" 
                    name="phoneNumber" 
                    value={editData.phoneNumber} 
                    onChange={handleEditChange} 
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                  <TextField
                    select
                    label="Giới tính"
                    name="gender"
                    value={editData.gender}
                    onChange={handleEditChange}
                    fullWidth
                    variant="outlined"
                    size="small"
                  >
                    {genderOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Ngày sinh"
                    name="dateOfBirth"
                    type="date"
                    value={editData.dateOfBirth}
                    onChange={handleEditChange}
                    fullWidth
                    variant="outlined"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField 
                    label="Địa chỉ" 
                    name="address" 
                    value={editData.address} 
                    onChange={handleEditChange} 
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                </Box>
                
                <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
                  <Button 
                    variant="outlined" 
                    startIcon={<Cancel />}
                    onClick={() => setEditMode(false)}
                    sx={{ borderRadius: 2 }}
                  >
                    Hủy bỏ
                  </Button>
                  <Button 
                    variant="contained" 
                    startIcon={<Save />}
                    onClick={handleSaveProfile}
                    sx={{ borderRadius: 2 }}
                  >
                    Lưu thay đổi
                  </Button>
                </Stack>
              </Stack>
            )}
          </Stack>
        </Paper>
      </Box>
      
      <Footer />
      
      {/* Change Password Dialog */}
      <Dialog 
        open={openPasswordDialog} 
        onClose={() => setOpenPasswordDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          fontWeight: 600
        }}>
          Đổi mật khẩu
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
          {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }}>{passwordSuccess}</Alert>}
          
          <TextField
            label="Mật khẩu hiện tại"
            name="currentPassword"
            type={showPassword.current ? 'text' : 'password'}
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            fullWidth
            sx={{ mb: 2 }}
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleClickShowPassword('current')}
                    edge="end"
                  >
                    {showPassword.current ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Mật khẩu mới"
            name="newPassword"
            type={showPassword.new ? 'text' : 'password'}
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            fullWidth
            sx={{ mb: 2 }}
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleClickShowPassword('new')}
                    edge="end"
                  >
                    {showPassword.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            type={showPassword.confirm ? 'text' : 'password'}
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            fullWidth
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleClickShowPassword('confirm')}
                    edge="end"
                  >
                    {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenPasswordDialog(false)}
            sx={{ borderRadius: 1 }}
          >
            Hủy bỏ
          </Button>
          <Button 
            variant="contained" 
            onClick={handleChangePassword}
            sx={{ borderRadius: 1 }}
            disabled={!!passwordSuccess}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Profile;