
// fe_bookinghomestay/src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Tabs,
  Tab,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../configs/apiConfig';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LogoutIcon from '@mui/icons-material/Logout';
import ViewTotalRevenue from '../../components/admin/ViewTotalRevenue';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();

  // Fetch users with filters
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.email) params.append('email', filters.email);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}api/Account/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Error fetching users');
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  // Ban/Unban user
  const handleBanUnban = async (userId, action) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}api/Account/${action}/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Failed to ${action} user`);
      fetchUsers();
    } catch (err) {
      setError(err.message || `Error during ${action}`);
      setLoading(false);
    }
  };

  // Log out
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <AppBar 
        position="static" 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              letterSpacing: 1,
              background: 'linear-gradient(45deg, #fff 30%, #f0f0f0 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Admin Dashboard
          </Typography>
          <IconButton 
            onClick={handleLogout}
            sx={{ 
              color: 'white',
              '&:hover': { 
                backgroundColor: 'rgba(255,255,255,0.1)',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
        
        {/* Enhanced Tab Bar */}
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'rgba(255,255,255,0.2)',
          backgroundColor: 'rgba(255,255,255,0.05)'
        }}>
          <Tabs 
            value={tab} 
            onChange={handleTabChange} 
            centered
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#fff',
                height: 3,
                borderRadius: '2px 2px 0 0'
              },
              '& .MuiTab-root': {
                color: 'rgba(255,255,255,0.7)',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                minHeight: 64,
                '&.Mui-selected': {
                  color: '#fff',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                },
                '&:hover': {
                  color: '#fff',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }
            }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon />
                  <span>Manage Users</span>
                </Box>
              }
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoneyIcon />
                  <span>View Total Revenue</span>
                </Box>
              }
            />
          </Tabs>
        </Box>
      </AppBar>

      {/* Content Area */}
      <Box sx={{ flex: 1, p: 3, backgroundColor: '#f5f7fa', overflow: 'auto' }}>
        {tab === 0 && (
          <Box sx={{ 
            backgroundColor: 'white', 
            borderRadius: 2, 
            p: 3, 
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: 600, 
                color: '#2c3e50',
                mb: 3
              }}
            >
              Manage Users
            </Typography>
            
            {/* Search Filters */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              mb: 3,
              flexWrap: 'wrap'
            }}>
              <TextField
                label="Filter by Name"
                value={filters.name}
                onChange={e => setFilters(f => ({ ...f, name: e.target.value }))}
                sx={{ minWidth: 200 }}
                size="small"
              />
              <TextField
                label="Filter by Email"
                value={filters.email}
                onChange={e => setFilters(f => ({ ...f, email: e.target.value }))}
                sx={{ minWidth: 250 }}
                size="small"
              />
              <Button 
                variant="contained" 
                onClick={fetchUsers}
                sx={{ 
                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)'
                  }
                }}
              >
                Search
              </Button>
            </Box>

            {/* Users Table */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Paper sx={{ overflow: 'hidden', borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map(user => (
                      <TableRow 
                        key={user.Id}
                        sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}
                      >
                        <TableCell>{user.Email}</TableCell>
                        <TableCell>{user.FirstName} {user.LastName}</TableCell>
                        <TableCell>
                          <Box sx={{
                            display: 'inline-block',
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor: user.Role === 'Admin' ? '#e3f2fd' : '#f3e5f5',
                            color: user.Role === 'Admin' ? '#1976d2' : '#7b1fa2',
                            fontWeight: 500
                          }}>
                            {user.Role}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{
                            display: 'inline-block',
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor: user.LockoutEnd ? '#ffebee' : '#e8f5e8',
                            color: user.LockoutEnd ? '#c62828' : '#2e7d32',
                            fontWeight: 500
                          }}>
                            {user.LockoutEnd ? 'Banned' : 'Active'}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {user.Role !== 'Admin' && (
                            user.LockoutEnd
                              ? <Button 
                                  color="success" 
                                  variant="outlined"
                                  size="small"
                                  onClick={() => handleBanUnban(user.Id, 'unban')}
                                >
                                  Unban
                                </Button>
                              : <Button 
                                  color="error" 
                                  variant="outlined"
                                  size="small"
                                  onClick={() => handleBanUnban(user.Id, 'ban')}
                                >
                                  Ban
                                </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )}
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </Box>
        )}
        
        {tab === 1 && (
          <ViewTotalRevenue/>
        )}
      </Box>
    </Box>
  );
}

export default AdminDashboard;

