import { connectDB } from '../../../lib/db.js';
import BetaAccessRequest from '../../../models/betaAccessRequest.js';
import User from '../../../models/user.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// Verify admin token
// function verifyAdminToken(req) {
//   const token = req.headers['x-admin-token'];
//   if (!token) return null;

//   try {
//     const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
//     return decoded;
//   } catch (error) {
//     return null;
//   }
// }

function verifyAdminToken(req) {
  const token =
    req.headers["x-admin-token"] ||
    req.headers["authorization"]?.replace("Bearer ", "");
  return token && token === process.env.ADMIN_TOKEN;
}

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default async function handler(req, res) {
    console.log("reached controller")
  await connectDB();

  const admin = verifyAdminToken(req);
  console.log(admin)
  if (!admin) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    // Get all beta requests
    try {
      const requests = await BetaAccessRequest.find({})
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        requests: requests.map(r => ({
          _id: r._id,
          fullName: r.fullName,
          email: r.email,
          designFirmLocation: r.designFirmLocation,
          roleDesignFocus: r.roleDesignFocus,
          curiosity: r.curiosity,
          howHeard: r.howHeard,
          status: r.status,
          createdAt: r.createdAt,
        }))
      });
    } catch (error) {
      console.error('Get beta requests error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    // Update request status (accept/decline)
    const { id, action } = req.body;

    if (!id || !['accept', 'decline'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid request' });
    }

    try {
      const request = await BetaAccessRequest.findById(id);
      if (!request) {
        return res.status(404).json({ success: false, error: 'Request not found' });
      }

      if (action === 'accept') {
        // Generate verification token
        const verificationToken = jwt.sign(
          { email: request.email, requestId: request._id },
          process.env.JWT_EMAIL_SECRET,
          { expiresIn: '7d' }
        );

        // Update request
        request.status = 'accepted';
        request.verificationToken = verificationToken;
        await request.save();

        // Send verification email
        const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/setup-password?token=${verificationToken}`;

        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: request.email,
          subject: 'Welcome to MOODbrary Beta - Complete Your Registration',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2b3a55;">Welcome to MOODbrary Beta!</h2>
              <p>Hi ${request.fullName},</p>
              <p>Your beta access request has been approved! We're excited to have you join our community of design professionals.</p>
              <p>To complete your registration and set up your password, please click the link below:</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background-color: #2b3a55; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Set Up Your Password</a>
              </p>
              <p>This link will expire in 7 days for security reasons.</p>
              <p>If you have any questions, feel free to reply to this email.</p>
              <p>Best regards,<br>The MOODbrary Team</p>
            </div>
          `,
        });

        res.status(200).json({
          success: true,
          message: 'Request accepted and verification email sent'
        });
      } else if (action === 'decline') {
        request.status = 'declined';
        await request.save();

        // Send decline email
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: request.email,
          subject: 'MOODbrary Beta Access Request Update',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2b3a55;">MOODbrary Beta Access Request</h2>
              <p>Hi ${request.fullName},</p>
              <p>Thank you for your interest in MOODbrary Beta. After careful consideration, we regret to inform you that we are unable to grant beta access at this time.</p>
              <p>We appreciate your understanding and hope to work with you in the future.</p>
              <p>Best regards,<br>The MOODbrary Team</p>
            </div>
          `,
        });

        res.status(200).json({
          success: true,
          message: 'Request declined and notification email sent'
        });
      }
    } catch (error) {
      console.error('Update beta request error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
}
