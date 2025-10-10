import Product from "../models/product";
import BrandTerritoryConfig from "../models/brandTerritoryConfig";

class TerritoryService {
  /**
   * Get all brands available in a territory
   */
  async getBrandsForTerritory(territoryCode) {
    const configs = await BrandTerritoryConfig.find({
      availableTerritories: territoryCode.toUpperCase(),
    }).select("brandName");

    return configs.map((c) => c.brandName);
  }

  /**
   * Get products available in a territory
   */
  async getProductsForTerritory(territoryCode, filters = {}) {
    const brands = await this.getBrandsForTerritory(territoryCode);

    const query = {
      brandName: { $in: brands },
      ...filters,
    };

    return await Product.find(query).lean();
  }

  /**
   * Check if a product is available in a territory
   */
  async isProductAvailable(productId, territoryCode) {
    const product = await Product.findById(productId);
    if (!product) return false;

    const config = await BrandTerritoryConfig.findOne({
      brandName: product.brandName,
    });

    return config?.availableTerritories.includes(territoryCode.toUpperCase());
  }

  /**
   * Update brand territory configuration
   */
  async updateBrandTerritories(brandName, territories) {
    return await BrandTerritoryConfig.findOneAndUpdate(
      { brandName },
      {
        brandName,
        availableTerritories: territories.map((t) => t.toUpperCase()),
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );
  }

  /**
   * Sync cached territories on products (run periodically)
   */
  async syncProductTerritories() {
    const configs = await BrandTerritoryConfig.find();

    for (const config of configs) {
      await Product.updateMany(
        { brandName: config.brandName },
        { $set: { availableTerritories: config.availableTerritories } }
      );
    }
  }
}

module.exports = new TerritoryService();


const brandTerritoryData = [
  { brandName: 'Akula', availableTerritories: ['NY', 'NY_EAST', 'NY_WEST', 'FAIRFIELD_CT', 'CT'] },
  { brandName: 'Bodaq', availableTerritories: ['NY', 'NY_EAST', 'NY_WEST', 'FAIRFIELD_CT', 'CT', 'RI', 'MA', 'VT', 'ME', 'NH'] },
  { brandName: 'Concertex', availableTerritories: ['NY', 'NY_EAST', 'NY_WEST', 'FAIRFIELD_CT'] },
  { brandName: 'Gravity', availableTerritories: ['NY', 'NY_EAST', 'FAIRFIELD_CT', 'CT', 'RI'] },
  { brandName: 'Jaipur Living', availableTerritories: ['NY', 'NY_EAST', 'NY_WEST', 'FAIRFIELD_CT', 'CT', 'RI', 'MA', 'VT', 'ME', 'NH'] },
  { brandName: 'Lumicor', availableTerritories: ['NY', 'FAIRFIELD_CT'] },
  { brandName: 'Nappa Tile', availableTerritories: ['NY', 'NY_EAST', 'NY_WEST', 'FAIRFIELD_CT'] },
  { brandName: 'Naturale', availableTerritories: ['NY', 'NY_EAST', 'FAIRFIELD_CT', 'CT', 'RI'] },
  { brandName: 'Newmor Digital', availableTerritories: ['NY', 'NY_EAST', 'NY_WEST', 'FAIRFIELD_CT', 'CT', 'RI', 'MA', 'VT', 'ME', 'NH'] },
  { brandName: 'Newmor Wallcovering', availableTerritories: ['NY', 'NY_EAST', 'NY_WEST', 'FAIRFIELD_CT', 'CT', 'RI', 'MA', 'VT', 'ME', 'NH'] },
  { brandName: 'OW Hospitality', availableTerritories: ['NY', 'NY_EAST', 'NY_WEST', 'FAIRFIELD_CT', 'CT', 'RI', 'MA', 'VT', 'ME', 'NH'] },
  { brandName: 'Stacked Wood', availableTerritories: ['NY', 'NY_EAST', 'FAIRFIELD_CT', 'CT', 'RI'] },
  { brandName: 'Sunbury Design', availableTerritories: ['NY', 'NY_EAST', 'NY_WEST', 'FAIRFIELD_CT', 'CT', 'RI', 'MA', 'VT', 'ME', 'NH'] },
  { brandName: 'Three Sheep and a Mill', availableTerritories: ['NY', 'NY_EAST', 'NY_WEST', 'FAIRFIELD_CT', 'CT', 'RI', 'MA', 'VT', 'ME', 'NH'] },
  { brandName: 'Tonik', availableTerritories: ['NY', 'NY_EAST', 'NY_WEST', 'FAIRFIELD_CT', 'CT', 'RI', 'MA', 'VT', 'ME', 'NH'] }
];

async function seedBrandTerritories() {
  try {
    for (const data of brandTerritoryData) {
      await BrandTerritoryConfig.findOneAndUpdate(
        { brandName: data.brandName },
        { ...data, lastUpdated: new Date() },
        { upsert: true }
      );
    }
    console.log('Brand territories seeded successfully');
  } catch (error) {
    console.error('Error seeding brand territories:', error);
  }
}
