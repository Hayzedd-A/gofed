import nextConnect from 'next-connect';
const { connectDB } = require('../../../lib/db.js');
const Product = require('../../../models/product.js');

const handler = nextConnect({
  onError(error, req, res) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  },
  onNoMatch(req, res) {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
  },
});

function isAuthorized(req) {
  const token = req.headers['x-admin-token'] || req.headers['authorization']?.replace('Bearer ', '');
  return token && token === process.env.ADMIN_TOKEN;
}

handler.use(async (req, res, next) => {
  if (!isAuthorized(req)) return res.status(401).json({ success: false, error: 'Unauthorized' });
  await connectDB();
  next();
});

handler.get(async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '20', 10);
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Product.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments({}),
  ]);
  res.json({ success: true, items, total, page, pages: Math.ceil(total / limit) });
});

handler.post(async (req, res) => {
  try {
    const data = req.body;
    const created = await Product.create(data);
    res.status(201).json({ success: true, item: created });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

handler.put(async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ success: false, error: 'Missing id' });
  try {
    const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, item: updated });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

handler.delete(async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ success: false, error: 'Missing id' });
  try {
    await Product.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

export default handler;
