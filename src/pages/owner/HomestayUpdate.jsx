import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Card,
  CardContent,
  Grid,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import {
  loadInitialData,
  uploadMultipleImages,
  updateHomestay,
  prepareHomestayData
} from '../../services/UpdateHomestay';

function HomestayUpdate() {
  const [homestays, setHomestays] = useState([]);
  const [selectedHomestay, setSelectedHomestay] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [neighbourhoods, setNeighbourhoods] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    streetAddress: '',
    selectedWardId: '',
    rules: '',
    selectedAmenities: [],
    selectedPolicies: [],
    selectedNeighbourhoods: [],
    selectedImages: [],
    imagePreview: []
  });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Auto hide notification
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await loadInitialData();
      setHomestays(data.homestays);
      setPolicies(data.policies);
      setAmenities(data.amenities);
      setNeighbourhoods(data.neighbourhoods);
      setWards(data.wards);
    } catch (error) {
      console.error('Error loading data:', error);
      setNotification({ show: true, message: 'Không thể tải dữ liệu. Vui lòng thử lại.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleHomestaySelect = (homestay) => {
    setSelectedHomestay(homestay);
    setForm({
      name: homestay.Name || '',
      description: homestay.Description || '',
      streetAddress: homestay.StreetAddress || '',
      selectedWardId: homestay.WardId || '',
      rules: homestay.Rules || '',
      selectedAmenities: (homestay.HomestayAmenities || []).map(ha => ha.AmenityId),
      selectedPolicies: (homestay.HomestayPolicies || []).map(hp => hp.PolicyId),
      selectedNeighbourhoods: (homestay.HomestayNeighbourhoods || []).map(hn => hn.NeighbourhoodId),
      selectedImages: [],
      imagePreview: (homestay.HomestayImages || []).map(img => ({
        url: img.ImageUrl,
        id: img.ImageId,
        sortOrder: img.SortOrder
      }))
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedHomestay(null);
    setForm({
      name: '',
      description: '',
      streetAddress: '',
      selectedWardId: '',
      rules: '',
      selectedAmenities: [],
      selectedPolicies: [],
      selectedNeighbourhoods: [],
      selectedImages: [],
      imagePreview: []
    });
    // Reset notification state
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    
    // Add files to selectedImages for upload
    setForm(prev => ({
      ...prev,
      selectedImages: [...prev.selectedImages, ...files]
    }));

    // Create preview URLs with SortOrder for display only
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setForm(prev => ({
          ...prev,
          imagePreview: [...prev.imagePreview, {
            url: e.target.result, // Base64 for preview only
            id: `new_${Date.now()}_${index}`, // Mark as new image
            sortOrder: prev.imagePreview.length + index + 1,
            isNew: true // Flag to identify new images
          }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (imageId) => {
    setForm(prev => {
      const imageToRemove = prev.imagePreview.find(img => img.id === imageId);
      
      return {
        ...prev,
        imagePreview: prev.imagePreview.filter(img => img.id !== imageId),
        // If removing a new image, also remove from selectedImages
        selectedImages: imageToRemove?.isNew 
          ? prev.selectedImages.filter((_, index) => {
              const newImageIndex = prev.imagePreview
                .filter(img => img.isNew)
                .findIndex(img => img.id === imageId);
              return index !== newImageIndex;
            })
          : prev.selectedImages
      };
    });
  };

  const uploadImages = async (files) => {
    return await uploadMultipleImages(files);
  };

  const handleSubmit = async () => {
    if (!selectedHomestay) return;

    setUploading(true);
    // Reset notification state

    try {
      // Upload new images if any
      let newImageUrls = [];
      const newImages = form.selectedImages.filter((_, index) => {
        const newImageCount = form.imagePreview.filter(img => img.isNew).length;
        return index < newImageCount;
      });
      
      if (newImages.length > 0) {
        console.log('Uploading new images:', newImages);
        newImageUrls = await uploadImages(newImages);
        console.log('Uploaded image URLs:', newImageUrls);
      }

      // Prepare homestay data using service
      const homestayData = prepareHomestayData(form, selectedHomestay, newImageUrls);

      // Update homestay using service
      await updateHomestay(selectedHomestay.HomestayId, homestayData);

      setNotification({ show: true, message: 'Cập nhật homestay thành công!', type: 'success' });
      
      // Close dialog immediately
      handleCloseDialog();
      
      // Reload homestays data after dialog is closed
      setTimeout(async () => {
        await loadData();
      }, 100);

    } catch (error) {
      console.error('Update error:', error);
      setNotification({ show: true, message: error.message || 'Cập nhật thất bại. Vui lòng thử lại.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      p: 4, 
      boxSizing: 'border-box', 
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
    }}>
      {/* Success/Error Notification */}
      {notification.show && (
        <Box
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            backgroundColor: notification.type === 'success' ? '#4caf50 !important' : '#f44336 !important',
            color: 'white !important',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: notification.type === 'success' 
              ? '0 8px 24px rgba(76, 175, 80, 0.3)' 
              : '0 8px 24px rgba(244, 67, 54, 0.3)',
            minWidth: '280px',
            fontWeight: 600,
            fontSize: '14px',
            animation: 'slideInRight 0.3s ease-out',
            pointerEvents: 'none',
            '@keyframes slideInRight': {
              '0%': {
                transform: 'translateX(100%)',
                opacity: 0
              },
              '100%': {
                transform: 'translateX(0)',
                opacity: 1
              }
            }
          }}
        >
          {notification.message}
        </Box>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={800} sx={{ 
          background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1
        }}>
          Cập nhật Homestay
        </Typography>
        <Typography variant="h6" sx={{ 
          color: '#64748b',
          fontWeight: 500
        }}>
          Chỉnh sửa thông tin và hình ảnh homestay của bạn
        </Typography>
      </Box>

      {/* Homestay List */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        },
        gap: 3
      }}>
        {homestays.map((homestay) => (
          <Box key={homestay.HomestayId}>
            <Card sx={{ 
              height: '100%', 
              cursor: 'pointer', 
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
              } 
            }}
                  onClick={() => handleHomestaySelect(homestay)}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {homestay.HomestayImages && homestay.HomestayImages.length > 0 ? (
                    <Avatar
                      src={homestay.HomestayImages[0].ImageUrl}
                      sx={{ 
                        width: 64, 
                        height: 64, 
                        mr: 2,
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  ) : (
                    <Avatar sx={{ 
                      width: 64, 
                      height: 64, 
                      mr: 2, 
                      bgcolor: 'grey.300',
                      borderRadius: '12px'
                    }}>
                      <Typography variant="caption">No Image</Typography>
                    </Avatar>
                  )}
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b', mb: 0.5 }}>
                      {homestay.Name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {homestay.StreetAddress}
                    </Typography>
                    {homestay.Ward && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        {homestay.Ward.Name} - {homestay.Ward.District?.Name}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
                  {homestay.Description || 'Không có mô tả'}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip 
                    label={`${homestay.HomestayAmenities?.length || 0} tiện ích`} 
                    size="small" 
                    color="primary"
                    sx={{ borderRadius: '8px', fontWeight: 600 }}
                  />
                  <Chip 
                    label={`${homestay.HomestayPolicies?.length || 0} quy định`} 
                    size="small" 
                    color="secondary"
                    sx={{ borderRadius: '8px', fontWeight: 600 }}
                  />
                  <Chip 
                    label={`${homestay.HomestayImages?.length || 0} ảnh`} 
                    size="small" 
                    color="info"
                    sx={{ borderRadius: '8px', fontWeight: 600 }}
                  />
                </Box>

                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  fullWidth
                  sx={{ 
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)',
                      boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
                    }
                  }}
                >
                  Cập nhật
                </Button>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {homestays.length === 0 && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 6,
          background: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '16px',
          border: '2px dashed rgba(0, 0, 0, 0.1)'
        }}>
          <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
            Không có homestay nào
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Vui lòng tạo homestay mới để bắt đầu
          </Typography>
        </Box>
      )}

      {/* Update Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
          color: 'white',
          borderRadius: '20px 20px 0 0'
        }}>
          <Typography variant="h5" fontWeight={700}>
            Cập nhật Homestay: {selectedHomestay?.Name}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Basic Information */}
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#1e293b' }}>
                Thông tin cơ bản
              </Typography>
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, 1fr)',
                },
                gap: 3
              }}>
                <TextField
                  label="Tên homestay"
                  value={form.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  fullWidth
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6366f1',
                      },
                    }
                  }}
                />
                <TextField
                  label="Địa chỉ"
                  value={form.streetAddress}
                  onChange={(e) => handleFormChange('streetAddress', e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6366f1',
                      },
                    }
                  }}
                />
                <FormControl fullWidth sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6366f1',
                    },
                  }
                }}>
                  <InputLabel>Phường/Xã</InputLabel>
                  <Select
                    value={form.selectedWardId}
                    onChange={(e) => handleFormChange('selectedWardId', e.target.value)}
                    label="Phường/Xã"
                  >
                    {wards.map((ward) => (
                      <MenuItem key={ward.WardId} value={ward.WardId}>
                        {ward.Name} - {ward.District?.Name || 'N/A'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                  <TextField
                    label="Mô tả"
                    value={form.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6366f1',
                        },
                      }
                    }}
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                  <TextField
                    label="Quy định"
                    value={form.rules}
                    onChange={(e) => handleFormChange('rules', e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6366f1',
                        },
                      }
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Amenities */}
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#1e293b' }}>
                Tiện ích
              </Typography>
              <FormControl fullWidth sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#6366f1',
                  },
                }
              }}>
                <InputLabel>Chọn tiện ích</InputLabel>
                <Select
                  multiple
                  value={form.selectedAmenities}
                  onChange={(e) => handleFormChange('selectedAmenities', e.target.value)}
                  renderValue={(selected) => selected.map(id => 
                    amenities.find(a => a.AmenityId === id)?.Name
                  ).join(', ')}
                >
                  {amenities.map((amenity) => (
                    <MenuItem key={amenity.AmenityId} value={amenity.AmenityId}>
                      <Checkbox checked={form.selectedAmenities.indexOf(amenity.AmenityId) > -1} />
                      <ListItemText primary={amenity.Name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Policies */}
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#1e293b' }}>
                Quy định
              </Typography>
              <FormControl fullWidth sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#6366f1',
                  },
                }
              }}>
                <InputLabel>Chọn quy định</InputLabel>
                <Select
                  multiple
                  value={form.selectedPolicies}
                  onChange={(e) => handleFormChange('selectedPolicies', e.target.value)}
                  renderValue={(selected) => selected.map(id => 
                    policies.find(p => p.PolicyId === id)?.Name
                  ).join(', ')}
                >
                  {policies.map((policy) => (
                    <MenuItem key={policy.PolicyId} value={policy.PolicyId}>
                      <Checkbox checked={form.selectedPolicies.indexOf(policy.PolicyId) > -1} />
                      <ListItemText primary={policy.Name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Neighbourhoods */}
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#1e293b' }}>
                Khu vực lân cận
              </Typography>
              <FormControl fullWidth sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#6366f1',
                  },
                }
              }}>
                <InputLabel>Chọn khu vực</InputLabel>
                <Select
                  multiple
                  value={form.selectedNeighbourhoods}
                  onChange={(e) => handleFormChange('selectedNeighbourhoods', e.target.value)}
                  renderValue={(selected) => selected.map(id => 
                    neighbourhoods.find(n => n.NeighbourhoodId === id)?.Name
                  ).join(', ')}
                >
                  {neighbourhoods.map((neighbourhood) => (
                    <MenuItem key={neighbourhood.NeighbourhoodId} value={neighbourhood.NeighbourhoodId}>
                      <Checkbox checked={form.selectedNeighbourhoods.indexOf(neighbourhood.NeighbourhoodId) > -1} />
                      <ListItemText primary={neighbourhood.Name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Images */}
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#1e293b' }}>
                Hình ảnh
              </Typography>
              
              {/* Current Images */}
              {form.imagePreview.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" mb={2} sx={{ fontWeight: 600, color: '#475569' }}>
                    Ảnh hiện tại:
                  </Typography>
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: 2
                  }}>
                    {form.imagePreview.map((image) => (
                      <Box key={image.id} sx={{ position: 'relative' }}>
                        <Avatar
                          src={image.url}
                          variant="rounded"
                          sx={{ 
                            width: '100%', 
                            height: 100,
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            bgcolor: 'error.main',
                            color: 'white',
                            width: 24,
                            height: 24,
                            '&:hover': { bgcolor: 'error.dark' }
                          }}
                          onClick={() => removeImage(image.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                        {image.isNew && (
                          <Chip
                            label="Mới"
                            size="small"
                            color="success"
                            sx={{
                              position: 'absolute',
                              top: -8,
                              left: -8,
                              fontSize: '0.6rem',
                              fontWeight: 600
                            }}
                          />
                        )}
                        <Typography variant="caption" sx={{ 
                          display: 'block', 
                          textAlign: 'center', 
                          mt: 1,
                          fontWeight: 600,
                          color: '#64748b'
                        }}>
                          Thứ tự: {image.sortOrder}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Upload New Images */}
              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AddIcon />}
                  disabled={uploading}
                  sx={{
                    borderRadius: '12px',
                    borderColor: '#6366f1',
                    color: '#6366f1',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#4f46e5',
                      backgroundColor: 'rgba(99, 102, 241, 0.04)'
                    }
                  }}
                >
                  Thêm ảnh mới
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                  />
                </Button>
                {uploading && (
                  <Typography variant="body2" color="info.main" sx={{ mt: 1, fontWeight: 600 }}>
                    Đang upload ảnh...
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={handleCloseDialog} 
            disabled={uploading}
            sx={{
              borderRadius: '12px',
              px: 3,
              py: 1.5,
              fontWeight: 600,
              borderColor: '#64748b',
              color: '#64748b',
              '&:hover': {
                borderColor: '#475569',
                backgroundColor: 'rgba(100, 116, 139, 0.04)'
              }
            }}
            variant="outlined"
          >
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={uploading || !form.name.trim()}
            sx={{
              borderRadius: '12px',
              px: 3,
              py: 1.5,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)',
                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
              },
              '&:disabled': {
                background: '#e2e8f0',
                color: '#94a3b8'
              }
            }}
          >
            {uploading ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default HomestayUpdate; 