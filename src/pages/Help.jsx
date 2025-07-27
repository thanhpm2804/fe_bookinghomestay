import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Stack
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Toolbar from '../components/Toolbar';
import Footer from '../components/Footer';

function Help() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <Toolbar />
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4, flex: 1 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" fontWeight={600} color="primary" sx={{ mb: 3, textAlign: 'center' }}>
            Trợ giúp
          </Typography>
          
          <Stack spacing={2}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Làm thế nào để đăng ký tài khoản?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Để đăng ký tài khoản, bạn có thể:
                  <br />• Nhấp vào "Đăng ký" trong menu dropdown
                  <br />• Điền đầy đủ thông tin cá nhân
                  <br />• Xác nhận email để kích hoạt tài khoản
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Quên mật khẩu phải làm sao?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Nếu quên mật khẩu, bạn có thể:
                  <br />• Nhấp vào "Quên mật khẩu?" trên trang đăng nhập
                  <br />• Nhập email đã đăng ký
                  <br />• Kiểm tra email để nhận mã xác nhận
                  <br />• Đặt lại mật khẩu mới
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Cách thay đổi thông tin cá nhân?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Để thay đổi thông tin cá nhân:
                  <br />• Đăng nhập vào tài khoản
                  <br />• Nhấp vào icon account ở góc phải
                  <br />• Chọn "Thông tin cá nhân"
                  <br />• Cập nhật thông tin cần thiết
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Liên hệ hỗ trợ</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Nếu cần hỗ trợ thêm, bạn có thể:
                  <br />• Email: support@myapp.com
                  <br />• Hotline: 1900-xxxx
                  <br />• Giờ làm việc: 8:00 - 18:00 (Thứ 2 - Thứ 6)
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Stack>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              onClick={() => window.history.back()}
            >
              Quay lại
            </Button>
          </Box>
        </Paper>
      </Box>
      <Footer />
    </Box>
  );
}

export default Help; 