// pages/api/auth/verify.js - Token verification endpoint

import nextConnect from 'next-connect';

const handler = nextConnect({
  onError(error, req, res) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  },
  onNoMatch(req, res) {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
  },
});

// GET /api/auth/verify - Verify Token
handler.get(async (req, res) => {
  try {
    const token = req.headers['x-admin-token'] || req.headers['authorization']?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided',
        authenticated: false
      });
    }

    // Verify token
    const isValid = token === process.env.ADMIN_TOKEN;

    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token',
        authenticated: false
      });
    }

    res.status(200).json({ 
      success: true, 
      authenticated: true,
      message: 'Token is valid'
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Verification failed',
      authenticated: false
    });
  }
});

export default handler;