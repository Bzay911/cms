require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const dbConnect = require('./dbConnect');
const cors = require('cors');
const cron = require('node-cron');
const { checkExpiringDocuments } = require('./utils/expiryTracker');
const workerRoutes = require('./routes/workerRoutes'); // Import worker routes
const adminRoutes = require('./routes/adminRoutes'); // Import admin routes
const workerFilterRoutes=require('./routes/WorkerFilterRoutes');

const app = express();
const PORT = process.env.PORT || 8000; // Default port is 5000 if not provided in .env

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use('/api/workers', workerRoutes); // All /api/workers routes are handled by workerRoutes
app.use('/api/admin', adminRoutes); // All /api/admin routes are handled by adminRoutes
app.use('/api/filters',workerFilterRoutes);
// MongoDB Connection
dbConnect().then(()=>{
  console.log('Connected to MongoDB successfully');

}).catch((err)=>{
  console.error('Failed to connect to MongoDB:',err);
});

// Cron job to check for expiring documents daily at 08:00
cron.schedule('* * * * *', async () => {
  try {
    await checkExpiringDocuments();
    console.log('Checked for expiring documents and sent notifications if needed.');
  } catch (error) {
    console.error('Error in running expiry tracker:', error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});

