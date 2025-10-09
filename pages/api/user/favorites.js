import { connectDB } from '../../../lib/db.js';
import User from '../../../models/user.js';
import Product from '../../../models/product.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  await connectDB();

  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.userId;
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  try {
    const user = await User.findById(userId).populate('favorites');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (req.method === 'GET') {
      return res.json({ success: true, favorites: user.favorites });
    }

    if (req.method === 'POST') {
      const { productId } = req.body;
      if (!productId) {
        return res.status(400).json({ success: false, error: 'Product ID required' });
      }
      if (!user.favorites.includes(productId)) {
        user.favorites.push(productId);
        await user.save();
      }
      return res.json({ success: true, favorites: user.favorites });
    }

    if (req.method === 'DELETE') {
      const { productId } = req.body;
      if (!productId) {
        return res.status(400).json({ success: false, error: 'Product ID required' });
      }
      user.favorites = user.favorites.filter(fav => fav.toString() !== productId);
      await user.save();
      return res.json({ success: true, favorites: user.favorites });
    }

    res.status(405).json({ success: false, error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Favorites error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
