import React from 'react';
import { Container, Grid, TextField } from '@mui/material';

function Test() {
  return (
    <Container sx={{ mt: 4 }}>
        ádasdsadasdasdsad
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Trường 1" />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Trường 2" />
        </Grid>
      </Grid>
    </Container>
  );
}

export default Test;
