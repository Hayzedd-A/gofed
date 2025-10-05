const axios = require('axios');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY not set. Vision analysis will fail until provided.');
}

async function analyzeImageToCriteria(imageUrl, userForm = {}) {
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

  const userPrompt = `User form details:\n- Sector: ${sector.length > 0 ? sector.join(', ') : 'Not specified'}\n- User Keywords: ${keywords.length > 0 ? keywords.join(', ') : 'Not specified'}\n\nPlease analyze the image and user keywords to provide the most relevant product criteria in JSON format.`;

  const payload = {
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: userPrompt },
          { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
        ],
      },
    ],
    max_tokens: 500,
    temperature: 0.2,
    response_format: { type: 'json_object' },
  };

  const res = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });

  const content = res.data.choices?.[0]?.message?.content || '{}';
  try {
    return JSON.parse(content);
  } catch (e) {
    throw new Error('Failed to parse OpenAI response as JSON');
  }
}

module.exports = { analyzeImageToCriteria };
