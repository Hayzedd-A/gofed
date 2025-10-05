#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/product');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');
  await mongoose.connect(uri);

  const file = path.join(__dirname, '..', 'data', 'sample-products.json');
  const items = JSON.parse(fs.readFileSync(file, 'utf8'));

  console.log(`Seeding ${items.length} products...`);
  await Product.deleteMany({});
  await Product.insertMany(items);
  console.log('Done');
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
