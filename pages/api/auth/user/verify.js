import jwt from 'jsonwebtoken';
import { connectDB } from '../../../../lib/db.js';
import User from '../../../../models/user.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  await connectDB();

  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, authenticated: false });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, authenticated: false });
    }

    res.json({ success: true, authenticated: true, user: { id: user._id, email: user.email } });
  } catch (error) {
    res.status(401).json({ success: false, authenticated: false, error: error.message });
  }
}
