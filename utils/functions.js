const { analyzeImageToCriteria } = require('./openaiClient');

function buildQueryFromCriteria(criteria) {
  const or = [];

  if (criteria?.keywords?.length) {
    or.push({ keywords: { $in: criteria.keywords } });
  }

  if (criteria?.colorPalette?.length) {
    or.push({ colorPalette: { $in: criteria.colorPalette } });
  }

  if (criteria?.application?.length) {
    or.push({ application: { $regex: criteria.application.join('|'), $options: 'i' } });
  }

  return or.length ? { $or: or } : {};
}

function calculateRelevanceScore(product, criteria) {
  let score = 0;

  if (Array.isArray(product.keywords) && Array.isArray(criteria.keywords) && criteria.keywords.length) {
    const matches = product.keywords.filter(k => criteria.keywords.some(ck => ck.toLowerCase() === k.toLowerCase())).length;
    score += (matches / criteria.keywords.length) * 0.4;
  } else {
    score += 0;
  }

  if (Array.isArray(product.colorPalette) && Array.isArray(criteria.colorPalette) && criteria.colorPalette.length) {
    const matches = product.colorPalette.filter(c => criteria.colorPalette.some(cc => cc.toLowerCase() === c.toLowerCase())).length;
    score += (matches / criteria.colorPalette.length) * 0.4;
  } else {
    score += 0;
  }

  if (typeof product.application === 'string' && Array.isArray(criteria.application) && criteria.application.length) {
    const appMatch = criteria.application.some(app => product.application.toLowerCase().includes(app.toLowerCase()));
    score += appMatch ? 0.2 : 0;
  }

  return score;
}

async function analyzeImageWithKeywords(imageUrl, userForm) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set');
  const criteria = await analyzeImageToCriteria(imageUrl, userForm);
  return criteria;
}

module.exports = { buildQueryFromCriteria, calculateRelevanceScore, analyzeImageWithKeywords };
