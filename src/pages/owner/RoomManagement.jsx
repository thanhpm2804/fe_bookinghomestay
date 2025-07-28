import React, { useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, Checkbox, ListItemText, InputLabel, FormControl, Pagination, Avatar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { fetchRooms, fetchAmenities, fetchBedTypes, fetchPriceTypes, addRoom, updateRoom, deleteRoom, fetchMyHomestays, uploadImage } from '../../services/room';
import { useEffect } from 'react';

// Dữ liệu phòng mẫu (giả lập)
const initialRooms = [
  { id: 1, name: 'Phòng Deluxe', price: 800000, capacity: 2 },
  { id: 2, name: 'Phòng Family', price: 1200000, capacity: 4 },
  { id: 3, name: 'Phòng Đơn', price: 500000, capacity: 1 },
];

// Dữ liệu mẫu cho các select (giả lập)

const scheduleTypes = [
  { id: 0, name: 'Đặt trước', value: 'Booking' },
  { id: 1, name: 'Chặn phòng', value: 'Blocked' },
  { id: 2, name: 'Bảo trì', value: 'Maintenance' },
];

function scheduleTypeStringToId(str) {
  if (str === 'Booking') return 0;
  if (str === 'Blocked') return 1;
  if (str === 'Maintenance') return 2;
  return 0;
}
function scheduleTypeIdToString(id) {
  if (id === 0 || id === '0') return 'Booking';
  if (id === 1 || id === '1') return 'Blocked';
  if (id === 2 || id === '2') return 'Maintenance';
  return 'Booking';
}

function toDatetimeLocal(str) {
  if (!str) return '';
  const d = new Date(str);
  // Lấy local time, không UTC
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

function RoomManagement() {
  const [rooms, setRooms] = useState(initialRooms);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    imgUrl: '',
    capacity: '',
    size: '',
    roomBeds: [],
    roomPrices: [],
    roomAmenities: [],
    roomSchedules: [],
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [amenities, setAmenities] = useState([]);
  const [bedTypes, setBedTypes] = useState([]);
  const [priceTypes, setPriceTypes] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [selectedHomestayId, setSelectedHomestayId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRooms, setTotalRooms] = useState(0);
  const [searchName, setSearchName] = useState('');
  
  // Notification states
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  // Delete confirmation dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Auto hide notification
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Lấy dữ liệu từ API khi load trang
  useEffect(() => {
    async function loadData() {
      const [homestayData, amenityData, bedTypeData, priceTypeData] = await Promise.all([
        fetchMyHomestays(),
        fetchAmenities(),
        fetchBedTypes(),
        fetchPriceTypes(),
      ]);
      const homestayList = homestayData.value || [];
      setHomestays(homestayList);
      let defaultHomestayId = '';
      if (homestayList.length > 0) {
        defaultHomestayId = homestayList[0].HomestayId || homestayList[0].homestayId;
        setSelectedHomestayId(defaultHomestayId);
        const roomData = await fetchRooms(defaultHomestayId, 0, pageSize, searchName);
        setRooms(roomData.value || []);
        setTotalRooms(roomData['@odata.count'] || 0);
      } else {
        setRooms([]);
        setTotalRooms(0);
      }
      setAmenities(amenityData.value || []);
      setBedTypes(bedTypeData.value || []);
      setPriceTypes(priceTypeData.value || []);
    }
    loadData();
  }, []);

  // Khi chọn homestay khác
  const handleHomestayChange = async (e) => {
    const homestayId = e.target.value;
    setSelectedHomestayId(homestayId);
    setCurrentPage(1);
    setSearchName(''); // Reset search khi đổi homestay
    const roomData = await fetchRooms(homestayId, 0, pageSize, searchName);
    setRooms(roomData.value || []);
    setTotalRooms(roomData['@odata.count'] || 0);
  };

  // Khi đổi trang
  const handlePageChange = async (event, value) => {
    setCurrentPage(value);
    const skip = (value - 1) * pageSize;
    const roomData = await fetchRooms(selectedHomestayId, skip, pageSize, searchName);
    setRooms(roomData.value || []);
    setTotalRooms(roomData['@odata.count'] || 0);
  };

  // Khi đổi pageSize
  const handlePageSizeChange = async (e) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setCurrentPage(1);
    const roomData = await fetchRooms(selectedHomestayId, 0, newSize, searchName);
    setRooms(roomData.value || []);
    setTotalRooms(roomData['@odata.count'] || 0);
  };

  // Mở dialog tạo/sửa
  const handleOpenDialog = (room = null) => {
    console.log('=== handleOpenDialog called ===');
    console.log('room parameter:', room);
    console.log('room is null/undefined:', room === null || room === undefined);
    console.log('current editingRoom before set:', editingRoom);
    setEditingRoom(room);
    console.log('editingRoom will be set to:', room);
    if (room) {
      setForm({
        name: room.name || room.Name || '',
        description: room.description || room.Description || '',
        imgUrl: room.imgUrl || room.ImgUrl || '',
        capacity: room.capacity || room.Capacity || '',
        size: room.size || room.Size || '',
        roomBeds: (room.roomBeds || room.RoomBeds || []).map(bed => ({
          bedTypeId: bed.bedTypeId || bed.BedTypeId || '',
          quantity: bed.quantity || bed.Quantity || ''
        })),
        roomPrices: (room.roomPrices || room.RoomPrices || []).map(price => ({
          priceTypeId: price.priceTypeId || price.PriceTypeId || '',
          amountPerNight: price.amountPerNight || price.AmountPerNight || ''
        })),
        roomAmenities: room.roomAmenities ? room.roomAmenities.map(a => a.amenityId || a.AmenityId) : (room.RoomAmenities ? room.RoomAmenities.map(a => a.amenityId || a.AmenityId) : []),
        roomSchedules: (room.roomSchedules || room.RoomSchedules || []).map(sch => ({
          ScheduleId: sch.ScheduleId || sch.scheduleId || '',
          StartDate: toDatetimeLocal(sch.StartDate || sch.startDate || ''),
          EndDate: toDatetimeLocal(sch.EndDate || sch.endDate || ''),
          ScheduleType: typeof sch.ScheduleType === 'string' ? scheduleTypeStringToId(sch.ScheduleType) : (sch.ScheduleType || sch.scheduleType || 0),
        })),
      });
    } else {
      setForm({
        name: '',
        description: '',
        imgUrl: '',
        capacity: '',
        size: '',
        roomBeds: [],
        roomPrices: [],
        roomAmenities: [],
        roomSchedules: [],
      });
    }
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRoom(null);
    setForm({
      name: '',
      description: '',
      imgUrl: '',
      capacity: '',
      size: '',
      roomBeds: [],
      roomPrices: [],
      roomAmenities: [],
      roomSchedules: [],
    });
    setSelectedImage(null);
    setImagePreview('');
    setUploading(false);
  };

  // Handle image selection
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };



  // Xử lý form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  // Khi lưu (thêm hoặc cập nhật)
  const handleSubmit = async () => {
    try {
      // Validation
      if (!form.name || !form.name.trim()) {
        setNotification({ show: true, message: 'Vui lòng nhập tên phòng', type: 'error' });
        return;
      }
      if (!form.capacity || Number(form.capacity) <= 0) {
        setNotification({ show: true, message: 'Vui lòng nhập sức chứa hợp lệ', type: 'error' });
        return;
      }
      if (!selectedHomestayId) {
        setNotification({ show: true, message: 'Vui lòng chọn homestay', type: 'error' });
        return;
      }
      // Nếu có ảnh mới được chọn, upload trước
      let finalImgUrl = form.imgUrl;
      if (selectedImage) {
        setUploading(true);
        try {
          const uploadResult = await uploadImage(selectedImage);
          // API trả về object có imageUrl, chỉ lấy imageUrl
          finalImgUrl = uploadResult.imageUrl || uploadResult;
          console.log('Upload successful:', uploadResult);
          console.log('Final image URL:', finalImgUrl);
        } catch (uploadError) {
          console.error('Upload failed:', uploadError);
          setNotification({ show: true, message: 'Upload ảnh thất bại. Vui lòng thử lại.', type: 'error' });
          setUploading(false);
          return; // Dừng lại nếu upload thất bại
        } finally {
          setUploading(false);
        }
      }

      // Đảm bảo các trường đúng key và format
      const isUpdate = !!editingRoom;
      
      // Chuẩn bị dữ liệu cơ bản
      const roomData = {
        name: form.name,
        description: form.description,
        imgUrl: finalImgUrl,
        homestayId: selectedHomestayId,
        capacity: Number(form.capacity),
        size: form.size ? Number(form.size) : undefined,
      };

      // Chuẩn bị roomBeds
      if (Array.isArray(form.roomBeds) && form.roomBeds.length > 0) {
        roomData.roomBeds = form.roomBeds.map(bed => ({
          bedTypeId: bed.bedTypeId || bed.BedTypeId || '',
          quantity: Number(bed.quantity || bed.Quantity || 0)
        }));
      }

      // Chuẩn bị roomPrices
      if (Array.isArray(form.roomPrices) && form.roomPrices.length > 0) {
        roomData.roomPrices = form.roomPrices.map(price => ({
          priceTypeId: price.priceTypeId || price.PriceTypeId || '',
          amountPerNight: Number(price.amountPerNight || price.AmountPerNight || 0)
        }));
      }

      // Chuẩn bị roomAmenities
      if (Array.isArray(form.roomAmenities) && form.roomAmenities.length > 0) {
        roomData.roomAmenities = form.roomAmenities.map(id => ({ amenityId: id }));
      }

      // Chuẩn bị roomSchedules
      if (Array.isArray(form.roomSchedules) && form.roomSchedules.length > 0) {
        roomData.roomSchedules = form.roomSchedules.map(sch => {
          const base = {
            roomId: isUpdate ? (editingRoom.roomId || editingRoom.RoomId) : '',
            startDate: sch.StartDate ? new Date(sch.StartDate).toISOString() : '',
            endDate: sch.EndDate ? new Date(sch.EndDate).toISOString() : '',
            scheduleType: scheduleTypeIdToString(sch.ScheduleType),
          };
          if (isUpdate && sch.ScheduleId) {
            return { ...base, scheduleId: sch.ScheduleId };
          }
          return base;
        });
      }

      console.log('Room data to submit:', roomData);
      console.log('editingRoom value:', editingRoom);
      console.log('isUpdate check:', !!editingRoom);

      if (editingRoom) {
        // Thêm roomId khi update
        roomData.roomId = editingRoom.roomId || editingRoom.RoomId;
        console.log('Updating room with ID:', roomData.roomId);
        await updateRoom(editingRoom.roomId || editingRoom.RoomId, roomData);
        setNotification({ show: true, message: 'Cập nhật phòng thành công!', type: 'success' });
      } else {
        console.log('Adding new room');
        await addRoom(roomData);
        setNotification({ show: true, message: 'Thêm phòng thành công!', type: 'success' });
      }

      // Sau khi thêm/sửa, reload lại danh sách phòng
      const skip = (currentPage - 1) * pageSize;
      const roomDataRes = await fetchRooms(selectedHomestayId, skip, pageSize, searchName);
      setRooms(roomDataRes.value || []);
      setTotalRooms(roomDataRes['@odata.count'] || 0);
      handleCloseDialog();
    } catch (error) {
      console.error('Submit failed:', error);
      const errorMessage = error.message || 'Thêm/cập nhật phòng thất bại. Vui lòng thử lại.';
      setNotification({ show: true, message: errorMessage, type: 'error' });
    }
  };
  // Xử lý search
  const handleSearch = async () => {
    if (!selectedHomestayId) return;
    
    setCurrentPage(1);
    const roomData = await fetchRooms(selectedHomestayId, 0, pageSize, searchName);
    setRooms(roomData.value || []);
    setTotalRooms(roomData['@odata.count'] || 0);
  };

  // Xử lý khi nhấn Enter trong search
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  // Clear search
  const handleClearSearch = async () => {
    setSearchName('');
    setCurrentPage(1);
    const roomData = await fetchRooms(selectedHomestayId, 0, pageSize, '');
    setRooms(roomData.value || []);
    setTotalRooms(roomData['@odata.count'] || 0);
  };

  // Xóa phòng
  const handleDelete = (room) => {
    setRoomToDelete(room);
    setDeleteDialogOpen(true);
  };

  // Xác nhận xóa phòng
  const handleConfirmDelete = async () => {
    if (!roomToDelete) return;
    
    setDeleting(true);
    try {
      const roomId = roomToDelete.RoomId || roomToDelete.roomId;
      await deleteRoom(roomId);
      
      setNotification({ show: true, message: 'Xóa phòng thành công!', type: 'success' });
      
      // Reload room list
      const skip = (currentPage - 1) * pageSize;
      const roomData = await fetchRooms(selectedHomestayId, skip, pageSize, searchName);
      setRooms(roomData.value || []);
      setTotalRooms(roomData['@odata.count'] || 0);
      
      // Close dialog
      setDeleteDialogOpen(false);
      setRoomToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
      const errorMessage = error.message || 'Xóa phòng thất bại. Vui lòng thử lại.';
      setNotification({ show: true, message: errorMessage, type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  // Hủy xóa phòng
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setRoomToDelete(null);
  };

  // Thêm/xóa dòng động cho các array field
  const handleAddBed = () => {
    setForm({ ...form, roomBeds: [...form.roomBeds, { bedTypeId: '', quantity: '' }] });
  };
  const handleBedChange = (idx, field, value) => {
    const newBeds = [...form.roomBeds];
    newBeds[idx][field] = value;
    setForm({ ...form, roomBeds: newBeds });
  };
  const handleRemoveBed = (idx) => {
    const newBeds = [...form.roomBeds];
    newBeds.splice(idx, 1);
    setForm({ ...form, roomBeds: newBeds });
  };

  const handleAddPrice = () => {
    setForm({ ...form, roomPrices: [...form.roomPrices, { priceTypeId: '', amountPerNight: '' }] });
  };
  const handlePriceChange = (idx, field, value) => {
    const newPrices = [...form.roomPrices];
    newPrices[idx][field] = value;
    setForm({ ...form, roomPrices: newPrices });
  };
  const handleRemovePrice = (idx) => {
    const newPrices = [...form.roomPrices];
    newPrices.splice(idx, 1);
    setForm({ ...form, roomPrices: newPrices });
  };

  const handleAmenitiesChange = (event) => {
    const value = event.target.value;
    setForm({ ...form, roomAmenities: value });
  };

  const handleAddSchedule = () => {
    setForm({
      ...form,
      roomSchedules: [
        ...form.roomSchedules,
        {
          ScheduleId: '',
          StartDate: '',
          EndDate: '',
          ScheduleType: 0,
        },
      ],
    });
  };
  const handleScheduleChange = (idx, field, value) => {
    const newSchedules = [...form.roomSchedules];
    newSchedules[idx][field] = value;
    setForm({ ...form, roomSchedules: newSchedules });
  };
  const handleRemoveSchedule = (idx) => {
    const newSchedules = [...form.roomSchedules];
    newSchedules.splice(idx, 1);
    setForm({ ...form, roomSchedules: newSchedules });
  };

  return (
    <Box sx={{ width: '100%', p: 3, boxSizing: 'border-box', background: '#fff', borderRadius: 3, boxShadow: 2 }}>
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
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: notification.type === 'success' 
              ? '0 4px 12px rgba(76, 175, 80, 0.3)' 
              : '0 4px 12px rgba(244, 67, 54, 0.3)',
            minWidth: '250px',
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

      {/* Header với title và button thêm */}
      <Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 2,
    mb: 3,
    
    mx: 'auto',
  }}
>
  <Typography variant="h5" fontWeight={700}>
    Quản lý phòng
  </Typography>

  {/* Dropdown chọn homestay */}
  <FormControl sx={{ minWidth: 220, flexGrow: 1 }}>
    <InputLabel>Chọn Homestay</InputLabel>
    <Select
      value={selectedHomestayId}
      onChange={handleHomestayChange}
      label="Chọn Homestay"
    >
      {homestays.map((hs) => (
        <MenuItem key={hs.HomestayId || hs.homestayId} value={hs.HomestayId || hs.homestayId}>
          {hs.Name || hs.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>

  {/* Search box */}
  <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 2, minWidth: 300 }}>
    <TextField
      fullWidth
      label="Tìm kiếm theo tên phòng"
      value={searchName}
      onChange={(e) => setSearchName(e.target.value)}
      onKeyDown={handleSearchKeyPress}
      size="small"
    />
    <Button
      variant="contained"
      onClick={handleSearch}
      disabled={!selectedHomestayId}
      sx={{
        ml: 1,
        minWidth: 40,
        px: 2,
        backgroundColor: '#6366f1',
        '&:hover': { backgroundColor: '#4f46e5' }
      }}
    >
      Tìm
    </Button>
    {searchName && (
      <Button
        variant="outlined"
        onClick={handleClearSearch}
        disabled={!selectedHomestayId}
        sx={{
          ml: 1,
          minWidth: 40,
          px: 2,
          borderColor: '#ef4444',
          color: '#ef4444',
          '&:hover': {
            borderColor: '#dc2626',
            backgroundColor: '#fef2f2'
          }
        }}
      >
        Xóa
      </Button>
    )}
  </Box>

  <Button
    variant="contained"
    startIcon={<AddIcon />}
    onClick={() => handleOpenDialog(null)}
    disabled={!selectedHomestayId}
    sx={{ minWidth: 150 }}
  >
    Thêm phòng
  </Button>
</Box>

      <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)' }}>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Ảnh</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Tên phòng</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Mô tả</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Sức chứa</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Diện tích</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Giường</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Giá</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Tiện ích</TableCell>
              <TableCell align="right" sx={{ color: '#fff', fontWeight: 700 }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.RoomId}>
                <TableCell>
                  {room.ImgUrl ? (
                    <Avatar 
                      src={room.ImgUrl} 
                      variant="rounded" 
                      sx={{ width: 60, height: 45 }}
                    />
                  ) : (
                    <Avatar 
                      variant="rounded" 
                      sx={{ width: 60, height: 45, bgcolor: 'grey.300' }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        No Image
                      </Typography>
                    </Avatar>
                  )}
                </TableCell>
                <TableCell>{room.Name}</TableCell>
                <TableCell>{room.Description || '-'}</TableCell>
                <TableCell>{room.Capacity}</TableCell>
                <TableCell>{room.Size}</TableCell>
                <TableCell>
                  {room.RoomBeds && room.RoomBeds.length > 0
                    ? room.RoomBeds.map((bed, idx) => {
                        const bt = bedTypes.find(bt => bt.BedTypeId === bed.BedTypeId);
                        return bt ? `${bt.Name} (${bed.Quantity})${idx < room.RoomBeds.length - 1 ? ', ' : ''}` : '';
                      })
                    : '-'}
                </TableCell>
                <TableCell>
                  {room.RoomPrices && room.RoomPrices.length > 0
                    ? room.RoomPrices.map((price, idx) => {
                        const pt = priceTypes.find(pt => pt.PriceTypeId === price.PriceTypeId);
                        return pt ? `${pt.TypeName}: ${price.AmountPerNight}${idx < room.RoomPrices.length - 1 ? ', ' : ''}` : '';
                      })
                    : '-'}
                </TableCell>
                <TableCell>
                  {room.RoomAmenities && room.RoomAmenities.length > 0
                    ? room.RoomAmenities.map((a, idx) => {
                        const am = amenities.find(am => am.AmenityId === a.AmenityId);
                        return am ? `${am.Name}${idx < room.RoomAmenities.length - 1 ? ', ' : ''}` : '';
                      })
                    : '-'}
                </TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpenDialog(room)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(room)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {rooms.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    Không có phòng nào
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Pagination controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
        <Typography variant="body2">Tổng số phòng: {totalRooms}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2">Số phòng/trang:</Typography>
          <Select value={pageSize} onChange={handlePageSizeChange} size="small">
            {[5, 10, 20, 50].map(size => (
              <MenuItem key={size} value={size}>{size}</MenuItem>
            ))}
          </Select>
          <Pagination
            count={Math.ceil(totalRooms / pageSize) || 1}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
          />
        </Box>
      </Box>
      {/* Dialog thêm/sửa phòng */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRoom ? 'Cập nhật phòng' : 'Thêm phòng mới'} 
          {editingRoom && ` (ID: ${editingRoom.RoomId || editingRoom.roomId})`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <TextField label="Tên phòng" name="name" value={form.name} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Mô tả" name="description" value={form.description} onChange={handleChange} fullWidth margin="normal" multiline rows={2} />
            
            {/* Image Upload Section */}
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Ảnh phòng</Typography>
              
              {/* Current image display */}
              {form.imgUrl && (
                <Box sx={{ mb: 2 }}>
                  <Avatar 
                    src={form.imgUrl} 
                    variant="rounded" 
                    sx={{ width: 200, height: 150, mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Ảnh hiện tại: {form.imgUrl}
                  </Typography>
                </Box>
              )}
              
              {/* Image preview */}
              {imagePreview && (
                <Box sx={{ mb: 2 }}>
                  <Avatar 
                    src={imagePreview} 
                    variant="rounded" 
                    sx={{ width: 200, height: 150, mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Ảnh mới đã chọn
                  </Typography>
                </Box>
              )}
              
              {/* Upload controls */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  component="label"
                  disabled={uploading}
                >
                  Chọn ảnh
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageSelect}
                  />
                </Button>
                
                {selectedImage && (
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                    ✓ Đã chọn: {selectedImage.name} (sẽ upload khi lưu)
                  </Typography>
                )}
                
                {uploading && (
                  <Typography variant="body2" color="info.main">
                    Đang upload ảnh...
                  </Typography>
                )}
              </Box>
            </Box>
            
            <TextField label="Sức chứa" name="capacity" type="number" value={form.capacity} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Diện tích (m2)" name="size" type="number" value={form.size} onChange={handleChange} fullWidth margin="normal" />
          </Box>
          {/* RoomBeds */}
          <Box mt={2}>
            <Typography fontWeight={600} marginBottom={2}>Loại giường</Typography>
            {form.roomBeds.map((bed, idx) => (
              <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Loại giường</InputLabel>
                  <Select value={bed.bedTypeId || ''} label="Loại giường" onChange={e => handleBedChange(idx, 'bedTypeId', e.target.value)}>
                    {bedTypes.map(bt => <MenuItem key={bt.BedTypeId} value={bt.BedTypeId}>{bt.Name}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField label="Số lượng" type="number" value={bed.quantity || ''} onChange={e => handleBedChange(idx, 'quantity', e.target.value)} sx={{ width: 120 }} />
                <Button color="error" onClick={() => handleRemoveBed(idx)}>Xóa</Button>
              </Box>
            ))}
            <Button onClick={handleAddBed} variant="outlined">Thêm loại giường</Button>
          </Box>
          {/* RoomPrices */}
          <Box mt={2}>
            <Typography fontWeight={600} marginBottom={2}>Loại giá</Typography>
            {form.roomPrices.map((price, idx) => (
              <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Loại giá</InputLabel>
                  <Select value={price.priceTypeId || ''} label="Loại giá" onChange={e => handlePriceChange(idx, 'priceTypeId', e.target.value)}>
                    {priceTypes.map(pt => <MenuItem key={pt.PriceTypeId} value={pt.PriceTypeId}>{pt.TypeName}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField label="Giá/đêm" type="number" value={price.amountPerNight || ''} onChange={e => handlePriceChange(idx, 'amountPerNight', e.target.value)} sx={{ width: 140 }} />
                <Button color="error" onClick={() => handleRemovePrice(idx)}>Xóa</Button>
              </Box>
            ))}
            <Button onClick={handleAddPrice} variant="outlined">Thêm loại giá</Button>
          </Box>
          {/* RoomAmenities */}
          <Box mt={2}>
            <Typography fontWeight={600} marginBottom={2}>Tiện ích</Typography>
            <FormControl fullWidth>
              <InputLabel>Chọn tiện ích</InputLabel>
              <Select
                multiple
                value={form.roomAmenities}
                onChange={handleAmenitiesChange}
                renderValue={selected => selected.map(id => amenities.find(a => a.AmenityId === id)?.Name).join(', ')}
              >
                {amenities.map(a => (
                  <MenuItem key={a.AmenityId} value={a.AmenityId}>
                    <Checkbox checked={form.roomAmenities.indexOf(a.AmenityId) > -1} />
                    <ListItemText primary={a.Name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          {/* RoomSchedules */}
          <Box mt={2}>
            <Typography fontWeight={600} marginBottom={2}>Lịch phòng</Typography>
            {form.roomSchedules.map((sch, idx) => (
              <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
                {/* <TextField label="RoomId" value={sch.roomId} onChange={e => handleScheduleChange(idx, 'roomId', e.target.value)} sx={{ width: 100 }} /> */}
                {/* <TextField label="ScheduleId" value={sch.ScheduleId} onChange={e => handleScheduleChange(idx, 'ScheduleId', e.target.value)} sx={{ width: 100 }} disabled /> */}
                <TextField label="Từ ngày" type="datetime-local" value={sch.StartDate} onChange={e => handleScheduleChange(idx, 'StartDate', e.target.value)} sx={{ width: 200 }} InputLabelProps={{ shrink: true }} />
                <TextField label="Đến ngày" type="datetime-local" value={sch.EndDate} onChange={e => handleScheduleChange(idx, 'EndDate', e.target.value)} sx={{ width: 200 }} InputLabelProps={{ shrink: true }} />
                <FormControl sx={{ minWidth: 140 }}>
                  <InputLabel>Loại lịch</InputLabel>
                  <Select value={sch.ScheduleType} label="Loại lịch" onChange={e => handleScheduleChange(idx, 'ScheduleType', e.target.value)}>
                    {scheduleTypes.map(st => <MenuItem key={st.id} value={st.id}>{st.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <Button color="error" onClick={() => handleRemoveSchedule(idx)}>Xóa</Button>
              </Box>
            ))}
            <Button onClick={handleAddSchedule} variant="outlined">Thêm lịch</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={uploading}>Hủy</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={uploading}
          >
            {uploading ? 'Đang xử lý...' : (editingRoom ? 'Cập nhật' : 'Thêm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#ef4444', fontWeight: 600 }}>
          Xác nhận xóa phòng
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn xóa phòng <strong>"{roomToDelete?.Name || roomToDelete?.name}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hành động này không thể hoàn tác. Tất cả thông tin về phòng này sẽ bị xóa vĩnh viễn.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={deleting}>
            Hủy
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained" 
            color="error"
            disabled={deleting}
            sx={{
              backgroundColor: '#ef4444',
              '&:hover': { backgroundColor: '#dc2626' }
            }}
          >
            {deleting ? 'Đang xóa...' : 'Xóa phòng'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RoomManagement; 