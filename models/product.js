const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  productName: String,
  colorwayName: String,
  imageUrl: String,
  shortDescription: String,
  application: String,
  keywords: [String],
  colorPalette: [String],
  performance: String,
  specSheetLink: String,
  brandName: { 
    type: String, 
    required: true,
    index: true // Add index for faster filtering
  },
  designerNote: String,
  productUrl: String,
  processed: { type: String, default: '' },
  
  // Optional: Cache territories directly on product for faster queries
  availableTerritories: [{ 
    type: String, 
    uppercase: true 
  }]
}, { timestamps: true });
ProductSchema.index({ brandName: 1, availableTerritories: 1 });

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
