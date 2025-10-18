import { connectDB } from '../../../lib/db.js';
import User from '../../../models/user.js';
import Product from '../../../models/product.js';
import SearchCriteria from '../../../models/searchCriteria.js';
import Favorite from '../../../models/favorite.js';
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
    if (req.method === 'GET') {
      const favorites = await Favorite.find({ userId }).populate({
        path: 'searchCriteria',
        model: 'SearchCriteria'
      }).populate({
        path: 'products',
        model: 'Product'
      });
      return res.json({ success: true, favorites });
    }

    if (req.method === 'POST') {
      const { productId, criteriaId } = req.body;
      if (!productId || !criteriaId) {
        return res.status(400).json({ success: false, error: 'Product ID and criteria ID required' });
      }

      // Find existing favorite folder or create new one
      let favorite = await Favorite.findOne({ userId, searchCriteria: criteriaId });
      if (!favorite) {
        const criteriaDoc = await SearchCriteria.findById(criteriaId);
        if (!criteriaDoc) {
          return res.status(404).json({ success: false, error: 'Search criteria not found' });
        }
        favorite = new Favorite({
          userId,
          searchCriteria: criteriaId,
          products: [],
          projectName: criteriaDoc.projectName,
        });
        await favorite.save();
      }

      // Add product to folder if not already present
      if (!favorite.products.includes(productId)) {
        favorite.products.push(productId);
        await favorite.save();
      }

      // Return updated favorites with populated data
      const favorites = await Favorite.find({ userId }).populate({
        path: 'searchCriteria',
        model: 'SearchCriteria'
      }).populate({
        path: 'products',
        model: 'Product'
      });

      return res.json({ success: true, favorites });
    }

    if (req.method === 'DELETE') {
      const { productId, folderId } = req.body;
      if (!productId || !folderId) {
        return res.status(400).json({ success: false, error: 'Product ID and folder ID required' });
      }

      const favorite = await Favorite.findOne({ _id: folderId, userId });
      if (!favorite) {
        return res.status(404).json({ success: false, error: 'Favorite folder not found' });
      }

      favorite.products = favorite.products.filter(p => p.toString() !== productId);
      await favorite.save();

      // Return updated favorites with populated data
      const favorites = await Favorite.find({ userId }).populate({
        path: 'searchCriteria',
        model: 'SearchCriteria'
      }).populate({
        path: 'products',
        model: 'Product'
      });

      return res.json({ success: true, favorites });
    }

    res.status(405).json({ success: false, error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Favorites error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
