import nextConnect from 'next-connect';
import multer from 'multer';
import axios from 'axios';
const { connectDB } = require('../../../lib/db.js');
const Product = require('../../../models/product.js');
const { analyzeImageWithKeywords, buildQueryFromCriteria, calculateRelevanceScore } = require('../../../utils/functions.js');
const { saveUploadedFile, deleteFileSafe } = require('../../../utils/fileHelpers.js');

export const config = {
  api: { bodyParser: false },
};

const upload = multer({ storage: multer.memoryStorage() });

const handler = nextConnect({
  onError(error, req, res) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  },
  onNoMatch(req, res) {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
  },
});

handler.use(upload.single('image'));

handler.post(async (req, res) => {
  await connectDB();

  const { sector, keywords, email, projectname, budgetTier } = req.body;
  let formKeywords = [];
  try {
    formKeywords = typeof keywords === 'string' ? keywords.split(',').map(s => s.trim()).filter(Boolean) : Array.isArray(keywords) ? keywords : [];
  } catch {}

  let tmpPath = null;
  let publicImageUrl = null;

  try {
    if (req.file) {
      const { filepath, filename } = saveUploadedFile(req.file);
      tmpPath = filepath;
      const base = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
      publicImageUrl = `${base}/uploads/${filename}`;
    }

    const userForm = {
      sector: Array.isArray(sector) ? sector : (sector ? [sector] : []),
      keywords: formKeywords,
      email, projectname, budgetTier,
    };

    let criteria = { keywords: formKeywords, colorPalette: [], application: [] };
    if (publicImageUrl) {
      criteria = await analyzeImageWithKeywords(publicImageUrl, userForm);
    }

    // Build query combining form keywords + criteria
    const combined = {
      keywords: Array.from(new Set([...(criteria.keywords || []), ...formKeywords])),
      colorPalette: criteria.colorPalette || [],
      application: criteria.application || [],
    };

    const query = buildQueryFromCriteria(combined);

    const products = await Product.find(query).lean();

    const scored = products
      .map(p => ({ ...p, relevanceScore: calculateRelevanceScore(p, combined) }))
      .filter(p => p.relevanceScore > 0.1)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 20);

    const webhookUrl = process.env.MARKETING_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await axios.post(webhookUrl, { email, projectname, sector, budgetTier, keywords: formKeywords, imageUrl: publicImageUrl || '' }, { timeout: 8000 });
      } catch (e) {
        console.warn('Webhook failed:', e.message);
      }
    }

    res.json({ success: true, products: scored });
  } catch (e) {
    console.error('Search error:', e);
    res.status(500).json({ success: false, error: e.message });
  } finally {
    if (tmpPath) deleteFileSafe(tmpPath);
  }
});

export default handler;
