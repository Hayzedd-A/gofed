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
  brandName: String,
  designerNote: String,
  productUrl: String,
  processed: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
