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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [uploading, setUploading] = useState(false);

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
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
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
    setError('');
    setSuccess('');
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
    setError('');
    setSuccess('');

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

      setSuccess('Cập nhật homestay thành công!');
      
      // Close dialog immediately
      handleCloseDialog();
      
      // Reload homestays data after dialog is closed
      setTimeout(async () => {
        await loadData();
      }, 100);

    } catch (error) {
      console.error('Update error:', error);
      setError(error.message || 'Cập nhật thất bại. Vui lòng thử lại.');
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
    <Box sx={{ width: '100%', p: 3, boxSizing: 'border-box', background: '#fff', borderRadius: 3, boxShadow: 2 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>Cập nhật Homestay</Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Homestay List */}
      <Grid container spacing={2}>
        {homestays.map((homestay) => (
          <Grid item xs={12} md={6} lg={4} key={homestay.HomestayId}>
            <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                  onClick={() => handleHomestaySelect(homestay)}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {homestay.HomestayImages && homestay.HomestayImages.length > 0 ? (
                    <Avatar
                      src={homestay.HomestayImages[0].ImageUrl}
                      sx={{ width: 60, height: 60, mr: 2 }}
                    />
                  ) : (
                    <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: 'grey.300' }}>
                      <Typography variant="caption">No Image</Typography>
                    </Avatar>
                  )}
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {homestay.Name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {homestay.StreetAddress}
                    </Typography>
                    {homestay.Ward && (
                      <Typography variant="body2" color="text.secondary">
                        {homestay.Ward.Name} - {homestay.Ward.District?.Name}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {homestay.Description || 'Không có mô tả'}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`${homestay.HomestayAmenities?.length || 0} tiện ích`} 
                    size="small" 
                    color="primary" 
                  />
                  <Chip 
                    label={`${homestay.HomestayPolicies?.length || 0} quy định`} 
                    size="small" 
                    color="secondary" 
                  />
                  <Chip 
                    label={`${homestay.HomestayImages?.length || 0} ảnh`} 
                    size="small" 
                    color="info" 
                  />
                </Box>

                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Cập nhật
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {homestays.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            Không có homestay nào để cập nhật
          </Typography>
        </Box>
      )}

      {/* Update Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Cập nhật Homestay: {selectedHomestay?.Name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Basic Information */}
            <Typography variant="h6" fontWeight={600}>Thông tin cơ bản</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Tên homestay"
                  value={form.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Địa chỉ"
                  value={form.streetAddress}
                  onChange={(e) => handleFormChange('streetAddress', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
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
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Mô tả"
                  value={form.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Quy định"
                  value={form.rules}
                  onChange={(e) => handleFormChange('rules', e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>

            <Divider />

            {/* Amenities */}
            <Typography variant="h6" fontWeight={600}>Tiện ích</Typography>
            <FormControl fullWidth>
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

            <Divider />

            {/* Policies */}
            <Typography variant="h6" fontWeight={600}>Quy định</Typography>
            <FormControl fullWidth>
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

            <Divider />

            {/* Neighbourhoods */}
            <Typography variant="h6" fontWeight={600}>Khu vực lân cận</Typography>
            <FormControl fullWidth>
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

            <Divider />

            {/* Images */}
            <Typography variant="h6" fontWeight={600}>Hình ảnh</Typography>
            
            {/* Current Images */}
            {form.imagePreview.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" mb={1}>Ảnh hiện tại:</Typography>
                <Grid container spacing={1}>
                  {form.imagePreview.map((image) => (
                    <Grid item key={image.id}>
                      <Box sx={{ position: 'relative' }}>
                        <Avatar
                          src={image.url}
                          variant="rounded"
                          sx={{ width: 100, height: 80 }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            bgcolor: 'error.main',
                            color: 'white',
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
                              fontSize: '0.6rem'
                            }}
                          />
                        )}
                        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
                          Thứ tự: {image.sortOrder}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Upload New Images */}
            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AddIcon />}
                disabled={uploading}
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
                <Typography variant="body2" color="info.main" sx={{ mt: 1 }}>
                  Đang upload ảnh...
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={uploading}>
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={uploading || !form.name.trim()}
          >
            {uploading ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default HomestayUpdate; 