import { connectDB } from '../../../lib/db.js';
import User from '../../../models/user.js';
import Product from '../../../models/product.js';
import SearchCriteria from '../../../models/searchCriteria.js';
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
      const user = await User.findById(userId).populate({
        path: 'favorites.searchCriteria',
        model: 'SearchCriteria'
      }).populate({
        path: 'favorites.products',
        model: 'Product'
      });
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      return res.json({ success: true, favorites: user.favorites });
    }

    if (req.method === 'POST') {
      const { productId, searchCriteria } = req.body;
      if (!productId || !searchCriteria) {
        return res.status(400).json({ success: false, error: 'Product ID and search criteria required' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Find or create search criteria
      let criteriaDoc = await SearchCriteria.findOne(searchCriteria);
      if (!criteriaDoc) {
        criteriaDoc = new SearchCriteria({
          ...searchCriteria,
          userId: userId,
        });
        await criteriaDoc.save();
      }

      // Find existing folder or create new one
      let folder = user.favorites.find(f => f.searchCriteria.toString() === criteriaDoc._id.toString());
      if (!folder) {
        folder = {
          searchCriteria: criteriaDoc._id,
          products: [],
          projectName: searchCriteria.projectName || 'Untitled Project',
        };
        user.favorites.push(folder);
      }

      // Add product to folder if not already present
      if (!folder.products.includes(productId)) {
        folder.products.push(productId);
        await user.save();
      }

      // Return updated favorites with populated data
      await user.populate({
        path: 'favorites.searchCriteria',
        model: 'SearchCriteria'
      });
      await user.populate({
        path: 'favorites.products',
        model: 'Product'
      });

      return res.json({ success: true, favorites: user.favorites });
    }

    if (req.method === 'DELETE') {
      const { productId, folderId } = req.body;
      if (!productId || !folderId) {
        return res.status(400).json({ success: false, error: 'Product ID and folder ID required' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const folder = user.favorites.id(folderId);
      if (!folder) {
        return res.status(404).json({ success: false, error: 'Folder not found' });
      }

      folder.products = folder.products.filter(p => p.toString() !== productId);
      await user.save();

      // Return updated favorites with populated data
      await user.populate({
        path: 'favorites.searchCriteria',
        model: 'SearchCriteria'
      });
      await user.populate({
        path: 'favorites.products',
        model: 'Product'
      });

      return res.json({ success: true, favorites: user.favorites });
    }

    res.status(405).json({ success: false, error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Favorites error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
