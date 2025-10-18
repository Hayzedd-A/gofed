import nextConnect from "next-connect";
import { connectDB } from "../../../lib/db.js";
import Territory from "../../../models/territory";
import Product from "../../../models/product.js";
import SearchCriteria from "../../../models/searchCriteria.js";
import {
  calculateRelevanceScore,
} from "../../../utils/functions.js";
import territoryService from "../../../service/territoryService";

export const config = {
  api: { bodyParser: false },
};

const handler = nextConnect({
  onError(error, req, res) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  },
  onNoMatch(req, res) {
    res.status(405).json({ success: false, error: "Method Not Allowed" });
  },
});

handler.get(async (req, res) => {
  await connectDB();

  const { criteriaId } = req.query;
  if (!criteriaId) {
    return res.status(400).json({ success: false, error: "Criteria ID required" });
  }

  try {
    const criteriaDoc = await SearchCriteria.findById(criteriaId);
    if (!criteriaDoc) {
      return res.status(404).json({ success: false, error: "Search criteria not found" });
    }

    const combined = criteriaDoc.combinedQuery;

    // Build query from saved criteria
    const query = {
      $or: [
        { productName: { $regex: combined.keywords.join('|'), $options: 'i' } },
        { description: { $regex: combined.keywords.join('|'), $options: 'i' } },
        { tags: { $in: combined.keywords } },
      ]
    };

    // Add color palette matching if available
    if (combined.colorPalette && combined.colorPalette.length > 0) {
      query.$or.push({
        colorPalette: { $in: combined.colorPalette }
      });
    }

    // Add application matching if available
    if (combined.application && combined.application.length > 0) {
      query.$or.push({
        application: { $in: combined.application }
      });
    }

    const products = await territoryService.getProductsForTerritory(
      criteriaDoc.territory,
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

    res.json({
      success: true,
      products: scored,
      groupedProducts,
      criteria: {
        projectName: criteriaDoc.projectName,
        sectors: criteriaDoc.sectors,
        keywords: criteriaDoc.keywords,
        budgetTier: criteriaDoc.budgetTier,
      }
    });
  } catch (e) {
    console.error("Search by criteria error:", e);
    res.status(500).json({ success: false, error: e.message });
  }
});

export default handler;
