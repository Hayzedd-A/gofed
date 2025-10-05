const { analyzeFormToCriteria } = require("./openaiClient");

function buildQueryFromCriteria(criteria) {
  const or = [];

  if (criteria?.keywords?.length) {
    or.push({ keywords: { $in: criteria.keywords } });
  }

  if (criteria?.colorPalette?.length) {
    or.push({ colorPalette: { $in: criteria.colorPalette } });
  }

  if (criteria?.application?.length) {
    or.push({
      application: { $regex: criteria.application.join("|"), $options: "i" },
    });
  }
  // Performance matching (optional - add if your schema has this field)
  if (criteria?.performance?.length) {
    or.push({
      performance: { $regex: criteria.performance.join("|"), $options: "i" },
    });
  }

  return or.length ? { $or: or } : {};
}

/**
 * Calculate relevance score for ranking
 * @param {Object} product - Product document
 * @param {Object} criteria - Search criteria
 * @returns {number} - Relevance score (0-1)
 */
function calculateRelevanceScore(product, criteria) {
  let score = 0;
  const weights = {
    keywords: 0.35,
    colorPalette: 0.35,
    application: 0.2,
    performance: 0.1,
  };

  // Keywords match
  if (product.keywords && criteria.keywords) {
    const matches = product.keywords.filter((k) =>
      criteria.keywords.some((ck) => ck.toLowerCase() === k.toLowerCase())
    ).length;
    if (criteria.keywords.length > 0) {
      score += (matches / criteria.keywords.length) * weights.keywords;
    }
  }

  // Color palette match
  if (product.colorPalette && criteria.colorPalette) {
    const matches = product.colorPalette.filter((c) =>
      criteria.colorPalette.some((cc) => cc.toLowerCase() === c.toLowerCase())
    ).length;
    if (criteria.colorPalette.length > 0) {
      score += (matches / criteria.colorPalette.length) * weights.colorPalette;
    }
  }

  // Application match
  if (product.application && criteria.application) {
    const appMatches = criteria.application.some((app) =>
      product.application.toLowerCase().includes(app.toLowerCase())
    );
    if (appMatches) score += weights.application;
  }

  // Performance match
  if (product.performance && criteria.performance) {
    const perfMatches = criteria.performance.some((perf) =>
      product.performance.toLowerCase().includes(perf.toLowerCase())
    );
    if (perfMatches) score += weights.performance;
  }

  return score;
}

async function analyzeImageWithKeywords(imageUrl, userForm) {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set");
  const criteria = await analyzeFormToCriteria(imageUrl, userForm);
  console.log("criteria response", criteria);
  if (criteria.success) {
    return criteria?.criteria;
  } else throw new Error("Error analysing the input");
}

module.exports = {
  buildQueryFromCriteria,
  calculateRelevanceScore,
  analyzeImageWithKeywords,
};
