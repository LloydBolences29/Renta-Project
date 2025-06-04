// src/pages/Dashboard.js
import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import Layout from '../layout/dashboardLayout';

const Dashboard = () => {
  return (
    <Layout>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Total Tenants</Typography>
              <Typography variant="h2" color="primary">45</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Pending Payments</Typography>
              <Typography variant="h2" color="error">5</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Maintenance Requests</Typography>
              <Typography variant="h2" color="secondary">12</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Dashboard;
