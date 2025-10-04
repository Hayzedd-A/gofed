const axios = require('axios');

/**
 * Analyzes image and user keywords to get structured product criteria
 * @param {string} imageUrl - Public URL of the image
 * @param {Object} userForm - User's form data with sector and keywords
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<Object>} - Structured keywords, colors, and applications
 */
async function getProductCriteriaFromImage(imageUrl, userForm, apiKey) {
  const { sector = [], keywords = [] } = userForm;

  const systemPrompt = `### You are a commercial interiors sourcing assistant for GoFedGroup. A user will submit a form of the sector they work in, the Keywords of the Product they need and a image related to what they are looking for (the image will be analyze by an AI, so I will be providing you the AI analyses).
### Your duty is to respond with 3 keywords, 2 Applications and 3 color palette that are most related to the client request.
### Here are the details on the products in our database which you will select from in your response, ensure your JSON value doesn't provide anything outside these lists, the most relatable options to the client request:
- Keywords are: 
Modern
Traditional 
Transitional 
Eclectic 
Minimal 
Textural 
Industrial 
Glam 
Luxe 
Boho 
Mid Century Modern 
Scandinavian 
Biophillic 
Art Deco 
Japandi 
Organic 
Romantic 
Timeless 
Formal 
Velvet
Dark
Light
Bold
Luxury
Luxe
Sophisticated
Serene
Organic
Warm
Rustic
Farmhouse
Coastal
Classic
- Color Palette are: 
Neutral
Beige 
Ivory 
Cream
White 
Off-white 
Gray 
Grey 
Brown
Green 
Terracotta 
Olive 
Ochre 
Burgundy 
Yellow 
Pink 
Red 
Blue 
Turquoise 
Black 
Multi 
Earth Tones
Metallic 
Gold 
Copper 
Bronze 
Brass 
Silver
- Performance are:
Scrubbable
Anti-microbial
Stain Treatment
Moisture Barrier
Sustainable
Outdoor
Easy Clean
Bleach Cleanable
Maritime
- Application are:
Wallcovering
Carpet
Drapery
Outdoor
Acoustic
Rug
Interior Film
Window Film
Mural
Special Finish
   
Just provide the most relatable 3 keywords, 3 color palette, 2 Applications in JSON format.
Example of your output should be:
{
  "keywords": ["Minimal", "Textural", "Luxe"],
  "colorPalette": ["Cream", "White", "Neutral"],
  "application": ["Wallcovering", "Carpet"]
}
NOTE: Your response after analysis should be always selected from the list of options I provided under Keywords, Color palette and Applications, do not respond anything other than what I have provided in the list in your JSON value, do not use elements that I didn't use in your response e.g Sand/Beige, I didn't use "/" in my list. Return ONLY valid JSON, no markdown formatting.`;

  const userPrompt = `User form details:
- Sector: ${sector.length > 0 ? sector.join(', ') : 'Not specified'}
- User Keywords: ${keywords.length > 0 ? keywords.join(', ') : 'Not specified'}

Please analyze the image and user keywords to provide the most relevant product criteria in JSON format.`;

  const payload = {
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: userPrompt
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
              detail: "high"
            }
          }
        ]
      }
    ],
    max_tokens: 500,
    temperature: 0.2,
    response_format: { type: "json_object" }
  };

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      payload,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const content = response.data.choices[0].message.content;
    const criteria = JSON.parse(content);

    return {
      success: true,
      criteria,
      usage: response.data.usage,
      model: response.data.model
    };

  } catch (error) {
    console.error('ChatGPT API Error:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
      statusCode: error.response?.status
    };
  }
}

/**
 * Search products using combined image and keyword analysis
 * @param {string} imageUrl - Public image URL
 * @param {Object} userForm - User form data
 * @returns {Promise<Object>} - Product search criteria
 */
async function analyzeImageWithKeywords(imageUrl, userForm) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const result = await getProductCriteriaFromImage(imageUrl, userForm, apiKey);
  
  if (!result.success) {
    throw new Error(`Analysis failed: ${result.error}`);
  }

  console.log(`✅ Image analyzed successfully`);
  console.log(`📊 Tokens used: ${result.usage.total_tokens}`);
  console.log(`🎯 Criteria:`, result.criteria);
  
  return result.criteria;
}

/**
 * Build MongoDB query from structured criteria
 * @param {Object} criteria - Structured criteria from ChatGPT
 * @returns {Object} - MongoDB query object
 */
function buildQueryFromCriteria(criteria) {
  const orConditions = [];

  // Keywords matching
  if (criteria.keywords && criteria.keywords.length > 0) {
    orConditions.push({
      keywords: { $in: criteria.keywords }
    });
  }

  // Color palette matching
  if (criteria.colorPalette && criteria.colorPalette.length > 0) {
    orConditions.push({
      colorPalette: { $in: criteria.colorPalette }
    });
  }

  // Application matching
  if (criteria.application && criteria.application.length > 0) {
    orConditions.push({
      application: {
        $regex: criteria.application.join('|'),
        $options: 'i'
      }
    });
  }

  return orConditions.length > 0 ? { $or: orConditions } : {};
}

/**
 * Calculate relevance score based on criteria match
 * @param {Object} product - Product document
 * @param {Object} criteria - Search criteria
 * @returns {number} - Relevance score (0-1)
 */
function calculateRelevanceScore(product, criteria) {
  let score = 0;
  let maxScore = 0;

  // Keywords match (40% weight)
  maxScore += 0.4;
  if (product.keywords && criteria.keywords) {
    const matches = product.keywords.filter(k =>
      criteria.keywords.some(ck => ck.toLowerCase() === k.toLowerCase())
    ).length;
    score += (matches / criteria.keywords.length) * 0.4;
  }

  // Color palette match (40% weight)
  maxScore += 0.4;
  if (product.colorPalette && criteria.colorPalette) {
    const matches = product.colorPalette.filter(c =>
      criteria.colorPalette.some(cc => cc.toLowerCase() === c.toLowerCase())
    ).length;
    score += (matches / criteria.colorPalette.length) * 0.4;
  }

  // Application match (20% weight)
  maxScore += 0.2;
  if (product.application && criteria.application) {
    const appMatches = criteria.application.some(app =>
      product.application.toLowerCase().includes(app.toLowerCase())
    );
    if (appMatches) score += 0.2;
  }

  return score;
}

// Express.js API endpoint
const express = require('express');
const router = express.Router();
const Product = require('./productSchema'); // Your product model

router.post('/search-by-image', async (req, res) => {
  try {
    const { imageUrl, sector, keywords } = req.body;

    // Validation
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'imageUrl is required'
      });
    }

    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(imageUrl)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image URL format'
      });
    }

    // Step 1: Get structured criteria from ChatGPT
    const userForm = {
      sector: sector || [],
      keywords: keywords || []
    };

    const criteria = await analyzeImageWithKeywords(imageUrl, userForm);

    // Step 2: Build MongoDB query
    const query = buildQueryFromCriteria(criteria);

    // Step 3: Search products
    const products = await Product.find(query).lean();

    // Step 4: Score and sort products
    const scoredProducts = products
      .map(product => ({
        ...product,
        relevanceScore: calculateRelevanceScore(product, criteria)
      }))
      .filter(p => p.relevanceScore > 0.2)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 20);

    res.json({
      success: true,
      criteria,
      products: scoredProducts,
      totalFound: scoredProducts.length
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Usage example
async function example() {
  const imageUrl = 'https://i.imgur.com/example.jpg';
  const userForm = {
    sector: ['Education', 'Senior Living', 'Hospitality'],
    keywords: ['pale blue', 'distant trees', 'late evening']
  };

  const criteria = await analyzeImageWithKeywords(imageUrl, userForm);
  console.log('Criteria:', criteria);
  // Output: { keywords: ["Serene", "Minimal", "Coastal"], colorPalette: ["Blue", "Gray", "White"], application: ["Wallcovering", "Drapery"] }
}

module.exports = {
  getProductCriteriaFromImage,
  analyzeImageWithKeywords,
  buildQueryFromCriteria,
  calculateRelevanceScore,
  router
};