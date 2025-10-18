import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '../../../lib/db.js';
import BetaAccessRequest from '../../../models/betaAccessRequest.js';
import User from '../../../models/user.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  await connectDB();

  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ success: false, error: 'Token and password are required' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET);
    const { email, requestId } = decoded;

    // Find the beta request
    const betaRequest = await BetaAccessRequest.findById(requestId);
    if (!betaRequest || betaRequest.email !== email || betaRequest.status !== 'accepted' || betaRequest.verificationToken !== token) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with beta request data
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName: betaRequest.fullName,
      designFirmLocation: betaRequest.designFirmLocation,
      roleDesignFocus: betaRequest.roleDesignFocus,
      curiosity: betaRequest.curiosity,
      howHeard: betaRequest.howHeard,
    });

    await user.save();

    // Clear verification token from beta request
    betaRequest.verificationToken = undefined;
    await betaRequest.save();

    // Generate JWT token for immediate login
    const userToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: userToken,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
      }
    });
  } catch (error) {
    console.error('Setup password error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ success: false, error: 'Invalid token' });
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
