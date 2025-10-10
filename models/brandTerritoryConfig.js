const mongoose = require("mongoose");

const BrandTerritoryConfigSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      required: true,
      unique: true,
    },
    availableTerritories: [
      {
        type: String,
        uppercase: true,
      },
    ], // Array of territory codes: ['NY', 'CT', 'RI']
    notes: String, // Optional notes about distribution
    lastUpdated: Date,
  },
  { timestamps: true }
);

// Index for faster queries
BrandTerritoryConfigSchema.index({ brandName: 1 });
BrandTerritoryConfigSchema.index({ availableTerritories: 1 });

module.exports =
  mongoose.models.BrandTerritoryConfig ||
  mongoose.model("BrandTerritoryConfig", BrandTerritoryConfigSchema);
