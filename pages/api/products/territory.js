import nextConnect from "next-connect";
const territory = require("../../../models/territory");

async function getAllTerritories() {
  try {
    const territories = await territory
      .find({ active: true })
      .sort({ region: 1, name: 1 });
    return territories;
  } catch (error) {
    console.error("Error fetching territories:", error);
    throw error;
  }
}

const handler = nextConnect({
  onError(error, req, res) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  },
  onNoMatch(req, res) {
    res.status(405).json({ success: false, error: "Method Not Allowed" });
  },
});

handler.get(async (req, res) => {
  try {
    const territories = await getAllTerritories();
    res.json({
      success: true,
      territories: territories.map(({ code, name, region }) => ({
        code,
        name,
        region,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default handler;
