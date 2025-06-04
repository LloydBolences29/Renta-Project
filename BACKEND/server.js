const express = require('express');
require('dotenv').config();
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const mongoose = require('mongoose');
const tenantRoutes = require('./Routes/tenantRoutes');
const propertiesRoutes = require('./Routes/propertiesRoutes');
const requestRoutes = require('./Routes/requestRoutes');
const authRoutes = require('./Routes/authRoutes');
const petRoutes = require('./Routes/petRoutes');
const payRoutes = require('./Routes/payRoute');
const applyRoutes = require('./Routes/applyRoutes');
const transactionRoute = require('./Routes/transactionRoute');
const revenueRoute = require('./Routes/revenueRoutes');
const visitRoutes = require('./Routes/visitRoutes');
const cors = require('cors');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const Tenant = require('./modelSchema/tenantSchema');
const moment = require('moment-timezone');
const sendPendingPaymentReminder = require('./Routes/notificationRoute');
const path = require('path');


// NEW: Require revenue snapshot utility and model
const { calculateRevenueSnapshot } = require('./modelSchema/revenueUtil');
const MonthlyRevenue = require('./modelSchema/revenueSchema');

// Express app
const app = express();

// Middleware 
app.use(cors({
  origin: 'http://localhost:3000' 
}));
app.use(express.json());
app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Routers
app.use('/api/tenants', tenantRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/request', requestRoutes);
app.use('/api/user', authRoutes);
app.use('/api/pet', petRoutes);
app.use('/api/pay', payRoutes);
app.use('/api/visitor-log', visitRoutes)
app.use('/api/revenue', revenueRoute);
app.use('/api/apply', applyRoutes);
app.use('/api', transactionRoute);
app.use('/uploads', express.static('uploads'));




// Cron job: Update tenants' paymentStatus if lease ends in 5 days or less
cron.schedule('* * * * *', async () => {
  try {
    // Use your desired local time zone, for example, 'Asia/Manila'
    const localNow = moment().tz('Asia/Manila');
    // Calculate the target date: 5 days from now, at the end of that day
    const targetDate = localNow.clone().add(5, 'days').endOf('day').toDate();

    console.log("Target date (5 days or less):", targetDate);

    // Update all tenants whose leaseEndDate is <= targetDate and paymentStatus is not already "Pending"
    const result = await Tenant.updateMany(
      {
        leaseEndDate: { $lte: targetDate },
        paymentStatus: { $ne: 'Pending' }
      },
      { $set: { paymentStatus: 'Pending' } }
    );

    console.log(`Cron job updated ${result.modifiedCount} tenants to Pending.`);
  } catch (error) {
    console.error('Error in tenant cron job:', error);
  }
});

//  Calculate and save revenue snapshot (runs every minute for testing)
// In production, change the schedule to run monthly (e.g., '59 23 L * *')
cron.schedule('* * * * *', async () => {
  try {
    const snapshot = await calculateRevenueSnapshot();
    // Get current month and year from snapshot
    const { month, year } = snapshot;

    // Update the existing snapshot for the current month if it exists,
    // otherwise create a new one.
    const updatedSnapshot = await MonthlyRevenue.findOneAndUpdate(
      { month, year },
      { $set: snapshot },
      { new: true, upsert: true } // upsert: true creates the document if it doesn't exist
    );

    console.log('Revenue snapshot updated or inserted:', updatedSnapshot);
  } catch (error) {
    console.error('Error saving revenue snapshot:', error);
  }
});


cron.schedule('0 8 * * *', async () => { // Every day at 8 AM
  try {
    const tenants = await Tenant.find({ paymentStatus: 'Pending' });

    for (const tenant of tenants) {
      const dueDate = new Date(tenant.leaseEndDate);
      const formattedDueDate = moment(dueDate).tz('Asia/Manila').format('MMMM D, YYYY');

      try {
        await sendPendingPaymentReminder(tenant, formattedDueDate);
        console.log(`Reminder email sent to: ${tenant.email}`);
      } catch (emailErr) {
        console.error(`Failed to send email to ${tenant.email}:`, emailErr.message);
      }
    }
  } catch (error) {
    console.error('Error during pending payment email cron job:', error.message);
  }
});

// Connect to DB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log('Connected to DB & listening on PORT', process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
