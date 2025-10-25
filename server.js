require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const verificationCodes = {}; // In-memory store

// ✅ Send code to user email
app.post('/send-code', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes[email] = code;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  const mailOptions = {
    from: `"BEACON" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to BEACON ',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <p>Hi there,</p>
        <p>We're so glad you’ve taken this first step toward caring for your emotional well-being.</p>
        <p>You’ve entered a safe, supportive space where your journey is seen, heard, and honored. We're here to walk beside you.</p>
        <p> Your verification code is: <span style="font-size: 18px; color:rgb(155, 148, 221);">${code}</span></p>
        <p>With warmth,<br>The BEACON Team</p>
      </div>
    `
  };
  
   

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Code sent to ${email}: ${code}`);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Email sending failed:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send email.' });
  }
});

// ✅ Verify user-provided code
app.post('/verify-code', (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, message: 'Email and code are required.' });
  }

  const validCode = verificationCodes[email];

  if (validCode && validCode === code) {
    delete verificationCodes[email]; // Invalidate after use
    console.log(`code verified for ${email}`);
    return res.json({ success: true });
  }

  console.log(`invalid code attempt for ${email}`);
  return res.status(400).json({ success: false, message: 'Invalid verification code.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
