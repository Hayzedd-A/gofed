import nextConnect from "next-connect";
import multer from "multer";
import axios from "axios";
import { connectDB } from "../../../lib/db.js";
import Territory from "../../../models/territory";

import Product from "../../../models/product.js";
import {
  analyzeImageWithKeywords,
  buildQueryFromCriteria,
  calculateRelevanceScore,
} from "../../../utils/functions.js";
import {
  saveUploadedFile,
  deleteFileSafe,
} from "../../../utils/fileHelpers.js";
import territoryService from "../../../service/territoryService";

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
    res.status(405).json({ success: false, error: "Method Not Allowed" });
  },
});

handler.use(upload.single("image"));

handler.post(async (req, res) => {
  await connectDB();

  const { sector, keywords, email, projectname, budgetTier, territory } = req.body;
  let formKeywords = [];
  try {
    formKeywords =
      typeof keywords === "string"
        ? keywords
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : Array.isArray(keywords)
        ? keywords
        : [];
  } catch {}

  let publicImageUrl = null;

  try {
    // ✅ Upload to Vercel Blob instead of local filesystem
    if (req.file) {
      const { url } = await saveUploadedFile(req.file);
      publicImageUrl = url;
    }

    const userForm = {
      sector: Array.isArray(sector) ? sector : sector ? [sector] : [],
      keywords: formKeywords,
      email,
      projectname,
      budgetTier,
    };

    let criteria = {
      keywords: formKeywords,
      colorPalette: [],
      application: [],
    };

    criteria = await analyzeImageWithKeywords(publicImageUrl, userForm);

    const combined = {
      keywords: Array.from(
        new Set([...(criteria.keywords || []), ...formKeywords])
      ),
      colorPalette: criteria.colorPalette || [],
      application: criteria.application || [],
    };

    const query = buildQueryFromCriteria(combined);

    // const products = await Product.find(query).lean();
    const products = await territoryService.getProductsForTerritory(
      territory,
      query
    );

    const scored = products
      .map((p) => ({
        ...p,
        relevanceScore: calculateRelevanceScore(p, combined),
      }))
      .filter((p) => p.relevanceScore > 0.1)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 100);

    // Group products by brandName
    const groupedProducts = scored.reduce((acc, product) => {
      const brand = product.brandName;
      if (!acc[brand]) {
        acc[brand] = [];
      }
      acc[brand].push(product);
      return acc;
    }, {});

    const webhookUrl = process.env.MARKETING_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await axios.post(
          webhookUrl,
          { email, projectname, sector, budgetTier, keywords: formKeywords },
          { timeout: 8000 }
        );
      } catch (e) {
        console.warn("Webhook failed:", e.message);
      }
    }

    res.json({ success: true, products: scored, groupedProducts, imageUrl: publicImageUrl });
  } catch (e) {
    console.error("Search error:", e);
    res.status(500).json({ success: false, error: e.message });
  } finally {
    if (publicImageUrl) await deleteFileSafe(publicImageUrl);
  }
});

export default handler;
