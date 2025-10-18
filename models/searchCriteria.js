const mongoose = require('mongoose');

const SearchCriteriaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  projectName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  sectors: [{
    type: String,
  }],
  keywords: [{
    type: String,
  }],
  budgetTier: {
    type: String,
    enum: ['budget', 'mid', 'luxury'],
    required: true,
  },
  territory: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  combinedQuery: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.models.SearchCriteria || mongoose.model('SearchCriteria', SearchCriteriaSchema);
