import nextConnect from "next-connect";
import multer from "multer";
import axios from "axios";
import { connectDB } from "../../../lib/db.js";
import Territory from "../../../models/territory";
import SearchCriteria from "../../../models/searchCriteria.js";

import jwt from "jsonwebtoken";
import Product from "../../../models/product.js";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

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
  let userId;
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    console.log("no token");
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.userId;
  } catch (error) {
    console.log("error in decoding, ", error);
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
  await connectDB();

  const { sector, keywords, email, projectname, budgetTier, territory } =
    req.body;
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
  let publicId = null;

  try {
    // ✅ Upload to Cloudinary
    if (req.file) {
      const { url, public_id } = await saveUploadedFile(req.file);
      publicImageUrl = url;
      publicId = public_id;
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

    // Save search criteria to database
    const searchCriteriaDoc = new SearchCriteria({
      userId,
      projectName: projectname,
      email,
      sectors: userForm.sector,
      keywords: formKeywords,
      budgetTier,
      territory,
      imageUrl: publicImageUrl,
      combinedQuery: combined,
    });
    await searchCriteriaDoc.save();

   

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

    res.json({
      success: true,
      products: scored,
      groupedProducts,
      imageUrl: publicImageUrl,
      criteriaId: searchCriteriaDoc._id,
    });
  } catch (e) {
    console.error("Search error:", e);
    res.status(500).json({ success: false, error: e.message });
  } finally {
    // Image is already deleted after analysis, no need to delete again
  }
});

export default handler;
