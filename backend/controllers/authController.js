const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Company = require('../models/Company');
const nodemailer = require('nodemailer');

// Register Company
exports.registerCompany = async (req, res) => {
  const { email, password, companyName } = req.body;
  try {
    let company = await Company.findOne({ email });
    if (company) {
      return res.status(400).json({ msg: 'Company already exists' });
    }

    company = new Company({ companyName, email, password });
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    company.password = await bcrypt.hash(password, salt);

    await company.save();

    const payload = { company: { id: company.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Send verification email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      }
    });

    const verificationLink = `http://localhost:5000/api/auth/verify/${token}`;
    const mailOptions = {
      from: process.env.EMAIL,
      to: company.email,
      subject: 'Verify your account',
      html: `<a href="${verificationLink}">Click here to verify</a>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.log(error);
      else console.log('Verification email sent: ' + info.response);
    });

    res.status(200).json({ msg: 'Company registered, please verify your email' });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Login Company
exports.loginCompany = async (req, res) => {
  const { email, password } = req.body;
  try {
    let company = await Company.findOne({ email });
    if (!company) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { company: { id: company.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
};
