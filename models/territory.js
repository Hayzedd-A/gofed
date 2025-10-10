const mongoose = require("mongoose");

const TerritorySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    }, // e.g., 'NY', 'CT', 'RI'
    name: {
      type: String,
      required: true,
    }, // e.g., 'New York', 'Connecticut'
    region: String, // Optional: 'Northeast', 'New England', etc.
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Territory || mongoose.model("Territory", TerritorySchema);
