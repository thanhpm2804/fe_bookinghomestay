import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';

function GridTest() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Grid System Test
      </Typography>
      
      {/* Test 1: Material-UI Grid */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Test 1: Material-UI Grid
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
            <Typography variant="h6">Item 1</Typography>
            <Typography>xs=12, md=6, lg=4</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, bgcolor: 'secondary.light', color: 'white' }}>
            <Typography variant="h6">Item 2</Typography>
            <Typography>xs=12, md=6, lg=4</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'white' }}>
            <Typography variant="h6">Item 3</Typography>
            <Typography>xs=12, md=6, lg=4</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'white' }}>
            <Typography variant="h6">Item 4</Typography>
            <Typography>xs=12, md=6, lg=4</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'white' }}>
            <Typography variant="h6">Item 5</Typography>
            <Typography>xs=12, md=6, lg=4</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'white' }}>
            <Typography variant="h6">Item 6</Typography>
            <Typography>xs=12, md=6, lg=4</Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Test 2: Inline Styles */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Test 2: Inline Styles (Fallback)
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2,
        '& > *': {
          flex: '1 1 100%',
          '@media (min-width: 600px)': {
            flex: '1 1 calc(50% - 8px)',
          },
          '@media (min-width: 960px)': {
            flex: '1 1 calc(33.333% - 8px)',
          },
        }
      }}>
        <Paper sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6">Inline Item 1</Typography>
          <Typography>100% → 50% → 33.33%</Typography>
        </Paper>
        
        <Paper sx={{ p: 2, bgcolor: 'secondary.main', color: 'white' }}>
          <Typography variant="h6">Inline Item 2</Typography>
          <Typography>100% → 50% → 33.33%</Typography>
        </Paper>
        
        <Paper sx={{ p: 2, bgcolor: 'success.main', color: 'white' }}>
          <Typography variant="h6">Inline Item 3</Typography>
          <Typography>100% → 50% → 33.33%</Typography>
        </Paper>
        
        <Paper sx={{ p: 2, bgcolor: 'warning.main', color: 'white' }}>
          <Typography variant="h6">Inline Item 4</Typography>
          <Typography>100% → 50% → 33.33%</Typography>
        </Paper>
        
        <Paper sx={{ p: 2, bgcolor: 'error.main', color: 'white' }}>
          <Typography variant="h6">Inline Item 5</Typography>
          <Typography>100% → 50% → 33.33%</Typography>
        </Paper>
        
        <Paper sx={{ p: 2, bgcolor: 'info.main', color: 'white' }}>
          <Typography variant="h6">Inline Item 6</Typography>
          <Typography>100% → 50% → 33.33%</Typography>
        </Paper>
      </Box>
      
      {/* Test 3: CSS Grid */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Test 3: CSS Grid
      </Typography>
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        },
        gap: 2
      }}>
        <Paper sx={{ p: 2, bgcolor: 'grey.200' }}>
          <Typography variant="h6">CSS Grid Item 1</Typography>
          <Typography variant="body2">grid-template-columns</Typography>
        </Paper>
        
        <Paper sx={{ p: 2, bgcolor: 'grey.300' }}>
          <Typography variant="h6">CSS Grid Item 2</Typography>
          <Typography variant="body2">grid-template-columns</Typography>
        </Paper>
        
        <Paper sx={{ p: 2, bgcolor: 'grey.400' }}>
          <Typography variant="h6">CSS Grid Item 3</Typography>
          <Typography variant="body2">grid-template-columns</Typography>
        </Paper>
        
        <Paper sx={{ p: 2, bgcolor: 'grey.500' }}>
          <Typography variant="h6">CSS Grid Item 4</Typography>
          <Typography variant="body2">grid-template-columns</Typography>
        </Paper>
        
        <Paper sx={{ p: 2, bgcolor: 'grey.600' }}>
          <Typography variant="h6">CSS Grid Item 5</Typography>
          <Typography variant="body2">grid-template-columns</Typography>
        </Paper>
        
        <Paper sx={{ p: 2, bgcolor: 'grey.700' }}>
          <Typography variant="h6">CSS Grid Item 6</Typography>
          <Typography variant="body2">grid-template-columns</Typography>
        </Paper>
      </Box>
      
      {/* Debug Info */}
      <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="h6">Debug Info:</Typography>
        <Typography variant="body2">
          • Test 1: Material-UI Grid (xs={12} md={6} lg={4})
        </Typography>
        <Typography variant="body2">
          • Test 2: Inline Styles with sx prop
        </Typography>
        <Typography variant="body2">
          • Test 3: CSS Grid with responsive breakpoints
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Resize browser window to see responsive behavior
        </Typography>
      </Box>
    </Box>
  );
}

export default GridTest; 