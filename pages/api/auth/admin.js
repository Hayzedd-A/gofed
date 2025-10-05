// pages/api/auth/admin.js or app/api/auth/admin/route.js (depending on Next.js version)

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

// POST /api/auth/admin - Login
handler.post(async (req, res) => {
  try {
    const { password, token } = req.body;

    // Validate input
    if (!password && !token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password or token is required' 
      });
    }

    // Check if provided credentials match the admin token
    const adminToken = process.env.ADMIN_TOKEN;
    const providedToken = token || password;

    if (!adminToken) {
      console.error('ADMIN_TOKEN not configured in environment variables');
      return res.status(500).json({ 
        success: false, 
        error: 'Server configuration error' 
      });
    }

    if (providedToken !== adminToken) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    // Successful authentication
    res.status(200).json({ 
      success: true, 
      token: adminToken,
      message: 'Login successful',
      expiresIn: '24h' // Optional: add expiry info
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Login failed' 
    });
  }
});

// DELETE /api/auth/admin - Logout
handler.delete(async (req, res) => {
  try {
    // Get token from headers
    const token = req.headers['x-admin-token'] || req.headers['authorization']?.replace('Bearer ', '');

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }

    // Verify it's a valid token before logout
    if (token !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }

    // In a token-based system, logout is handled client-side
    // But we can log the logout event or perform cleanup
    console.log('Admin logged out at:', new Date().toISOString());

    res.status(200).json({ 
      success: true, 
      message: 'Logout successful' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Logout failed' 
    });
  }
});

// GET /api/auth/admin/verify - Verify Token
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