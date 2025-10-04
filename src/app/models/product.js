const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    trim: true,
    index: true
  },
  
  colorwayName: {
    type: String,
    trim: true,
    index: true
  },
  
  imageUrl: {
    type: String,
    trim: true,
  },
  
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  application: {
    type: String,
    trim: true,
    index: true
  },
  
  keywords: {
    type: [String], // Array of keywords
    default: [],
  },
  
  colorPalette: {
    type: [String], // Array of colors
    default: [],
  },
  
  performance: {
    type: String,
    trim: true
  },
  
  specSheetLink: {
    type: String,
    trim: true,
  },
  
  brandName: {
    type: String,
    trim: true,
    index: true
  },
  
  designerNote: {
    type: String,
    trim: true
  },
  
  productUrl: {
    type: String,
    trim: true,
  },
  
  processed: {
    type: String,
    index: true
  }
  
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'products'
});

// Indexes for better query performance
productSchema.index({ productName: 1, colorwayName: 1 });
productSchema.index({ brandName: 1, application: 1 });
productSchema.index({ keywords: 1 });


const Product = mongoose.model('Product', productSchema);

module.exports = Product;