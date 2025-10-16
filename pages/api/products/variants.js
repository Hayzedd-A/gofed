import { connectDB } from '../../../lib/db.js';
import Product from '../../../models/product.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  await connectDB();

  const { brandName, productName } = req.query;

  if (!brandName || !productName) {
    return res.status(400).json({ success: false, error: 'brandName and productName are required' });
  }

  try {
    const variants = await Product.find({
      brandName: brandName,
      productName: productName,
    }).lean();

    res.json({ success: true, variants });
  } catch (error) {
    console.error('Variants error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
