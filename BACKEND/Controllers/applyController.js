require('dotenv').config();
const axios = require('axios');                // for reCAPTCHA verification
const Apply = require('../modelSchema/applySchema');
const { default: mongoose } = require('mongoose');
const { sendEmailNotification } = require('../modelSchema/notificationSchema'); 

// Create a new application
const createApplication = async (req, res) => {
  try {
    // Extract form data + reCAPTCHA token
    const { building, roomNumber, fullName, email, contactNumber, recaptchaToken } = req.body;

    // 1️⃣ Ensure token is present
    if (!recaptchaToken) {
      return res.status(400).json({ error: 'reCAPTCHA token missing' });
    }

    // 2️⃣ Verify token with Google
    const secret = process.env.RECAPTCHA_SECRET;
    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const { data: captchaRes } = await axios.post(
      verifyUrl,
      null,
      { params: { secret, response: recaptchaToken } }
    );

    if (!captchaRes.success) {
      console.error('reCAPTCHA failed:', captchaRes['error-codes']);
      return res.status(400).json({ error: 'Failed reCAPTCHA verification' });
    }

    // Create and save a new application document
    const application = new Apply({
      building,
      roomNumber,
      fullName,
      email,
      contactNumber,
    });
    await application.save();

    // Send confirmation email to the applicant
    await sendEmailNotification({
      to: email,
      subject: 'Application Received',
      html: `<p>Hello ${fullName},</p>
             <p>Your application has been received successfully. We will review your details and get back to you shortly.</p>
             <p>Thank you for your interest!</p>`,
    }).catch((err) => {
      console.error('Error sending applicant email:', err);
    });

    // Optionally, send a notification email to the admin
    await sendEmailNotification({
      to: process.env.ADMIN_EMAIL,
      subject: 'New Application Submitted',
      html: `<p>A new application has been submitted by ${fullName} (${email}).</p>
             <p>Building: ${building}</p>
             <p>Room: ${roomNumber}</p>
             <p>Contact: ${contactNumber}</p>`,
    }).catch((err) => {
      console.error('Error sending admin email:', err);
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all applications
const getApplications = async (req, res) => {
  try {
    const applications = await Apply.find();
    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a single application by its ID
const getApplicationById = async (req, res) => {
  try {
    const application = await Apply.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.status(200).json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update an application's status (e.g., to approve or reject)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Apply.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.status(200).json({
      message: 'Application status updated',
      application,
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteApplication = async (req, res) => {
  try {
    const application = await Apply.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
};
