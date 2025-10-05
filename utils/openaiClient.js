const axios = require("axios");
require("dotenv").config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn(
    "OPENAI_API_KEY not set. Vision analysis will fail until provided."
  );
}

// Centralized product database options for scalability
const PRODUCT_OPTIONS = {
  keywords: [
    "Modern",
    "Traditional",
    "Transitional",
    "Eclectic",
    "Minimal",
    "Textural",
    "Industrial",
    "Glam",
    "Luxe",
    "Boho",
    "Mid Century Modern",
    "Scandinavian",
    "Biophillic",
    "Art Deco",
    "Japandi",
    "Organic",
    "Romantic",
    "Timeless",
    "Formal",
    "Velvet",
    "Dark",
    "Light",
    "Bold",
    "Luxury",
    "Sophisticated",
    "Serene",
    "Warm",
    "Rustic",
    "Farmhouse",
    "Coastal",
    "Classic",
  ],
  colorPalette: [
    "Neutral",
    "Beige",
    "Ivory",
    "Cream",
    "White",
    "Off-white",
    "Gray",
    "Grey",
    "Brown",
    "Green",
    "Terracotta",
    "Olive",
    "Ochre",
    "Burgundy",
    "Yellow",
    "Pink",
    "Red",
    "Blue",
    "Turquoise",
    "Black",
    "Multi",
    "Earth Tones",
    "Metallic",
    "Gold",
    "Copper",
    "Bronze",
    "Brass",
    "Silver",
  ],
  performance: [
    "Scrubbable",
    "Anti-microbial",
    "Stain Treatment",
    "Moisture Barrier",
    "Sustainable",
    "Outdoor",
    "Easy Clean",
    "Bleach Cleanable",
    "Maritime",
  ],
  application: [
    "Wallcovering",
    "Carpet",
    "Drapery",
    "Outdoor",
    "Acoustic",
    "Rug",
    "Interior Film",
    "Window Film",
    "Mural",
    "Special Finish",
  ],
};

/**
 * Generate dynamic system prompt based on available options
 */
function generateSystemPrompt(includeImage = true) {
  const imageContext = includeImage
    ? "a user will submit a form of the sector they work in, the Keywords of the Product they need and an image related to what they are looking for."
    : "a user will submit a form of the sector they work in and the Keywords of the Product they need.";

  const analysisInstruction = includeImage
    ? "Please analyze the image and user keywords to provide the most relevant product criteria in JSON format."
    : "Please analyze the user keywords to provide the most relevant product criteria in JSON format.";

  return `### You are a commercial interiors sourcing assistant for GoFedGroup. ${imageContext}
### Your duty is to respond with 3 keywords, 2 Applications and 3 color palette that are most related to the client request.
### Here are the details on the products in our database which you will select from in your response, ensure your JSON value doesn't provide anything outside these lists:

- Keywords are: 
${PRODUCT_OPTIONS.keywords.join("\n")}

- Color Palette are: 
${PRODUCT_OPTIONS.colorPalette.join("\n")}

- Performance are:
${PRODUCT_OPTIONS.performance.join("\n")}

- Application are:
${PRODUCT_OPTIONS.application.join("\n")}
   
Just provide the most relatable 3 keywords, 3 color palette, 2 Applications in JSON format.
Example of your output should be:
{
  "keywords": ["Minimal", "Textural", "Luxe"],
  "colorPalette": ["Cream", "White", "Neutral"],
  "application": ["Wallcovering", "Carpet"]
  "perfomance": ["Outdoor", "Sustainable"]
}

NOTE: Your response must ONLY contain values from the lists above. Do not create new terms or combine terms with "/" or other separators. Return ONLY valid JSON, no markdown formatting.

${analysisInstruction}`;
}

/**
 * Analyze image and/or keywords to get product criteria
 * @param {Object} options - Analysis options
 * @param {string} [options.imageUrl] - Optional image URL
 * @param {Object} [options.userForm] - User form data
 * @param {string[]} [options.userForm.sector] - Sectors
 * @param {string[]} [options.userForm.keywords] - User keywords
 * @returns {Promise<Object>} - Structured criteria
 */
async function analyzeFormToCriteria(imageUrl, userForm = {}) {
  const { sector = [], keywords = [] } = userForm;

  // Determine if we have an image
  const hasImage = Boolean(imageUrl && imageUrl.trim());

  // Generate appropriate system prompt
  const systemPrompt = generateSystemPrompt(hasImage);

  // Build user prompt
  const userPromptText = `User form details:
- Sector: ${sector.length > 0 ? sector.join(", ") : "Not specified"}
- User Keywords: ${keywords.length > 0 ? keywords.join(", ") : "Not specified"}

${
  hasImage
    ? "Please analyze the image and user keywords."
    : "Please analyze the user keywords."
} Provide the most relevant product criteria in JSON format.`;

  // Build message content based on image availability
  const userContent = hasImage
    ? [
        { type: "text", text: userPromptText },
        { type: "image_url", image_url: { url: imageUrl, detail: "high" } },
      ]
    : [{ type: "text", text: userPromptText }];

  const payload = {
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    max_tokens: 500,
    temperature: 0.2,
    response_format: { type: "json_object" },
  };

  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      payload,
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const content = res.data.choices?.[0]?.message?.content || "{}";
    const criteria = JSON.parse(content);

    // Validate response contains expected fields
    if (!criteria.keywords || !criteria.colorPalette || !criteria.application) {
      throw new Error("Invalid response structure from OpenAI");
    }

    return {
      success: true,
      criteria,
      hasImage,
      usage: res.data.usage,
    };
  } catch (error) {
    console.error("OpenAI API Error:", error.response?.data || error.message);

    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
      hasImage,
    };
  }
}

/**
 * Build MongoDB query from criteria
 * @param {Object} criteria - Search criteria from OpenAI
 * @returns {Object} - MongoDB query object
 */
function buildMongoQuery(criteria) {
  const orConditions = [];

  // Keywords matching
  if (
    criteria.keywords &&
    Array.isArray(criteria.keywords) &&
    criteria.keywords.length > 0
  ) {
    orConditions.push({
      keywords: { $in: criteria.keywords },
    });
  }

  // Color palette matching
  if (
    criteria.colorPalette &&
    Array.isArray(criteria.colorPalette) &&
    criteria.colorPalette.length > 0
  ) {
    orConditions.push({
      colorPalette: { $in: criteria.colorPalette },
    });
  }

  // Application matching
  if (
    criteria.application &&
    Array.isArray(criteria.application) &&
    criteria.application.length > 0
  ) {
    orConditions.push({
      application: {
        $regex: criteria.application.join("|"),
        $options: "i",
      },
    });
  }

  // Performance matching (optional - add if your schema has this field)
  if (
    criteria.performance &&
    Array.isArray(criteria.performance) &&
    criteria.performance.length > 0
  ) {
    orConditions.push({
      performance: {
        $regex: criteria.performance.join("|"),
        $options: "i",
      },
    });
  }

  return orConditions.length > 0 ? { $or: orConditions } : {};
}

// Export for Next.js API routes
module.exports = {
  analyzeFormToCriteria,
  buildMongoQuery,
};
