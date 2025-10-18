import { connectDB } from '../../../lib/db.js';
import BetaAccessRequest from '../../../models/betaAccessRequest.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  await connectDB();

  const {
    fullName,
    email,
    designFirmLocation,
    roleDesignFocus,
    curiosity,
    howHeard
  } = req.body;

  // Validate required fields
  if (!fullName || !email || !designFirmLocation || !roleDesignFocus || !curiosity || !howHeard) {
    return res.status(400).json({
      success: false,
      error: 'All fields are required'
    });
  }

  try {
    // Check if request already exists for this email
    const existingRequest = await BetaAccessRequest.findOne({ email: email.toLowerCase() });
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        error: 'A beta access request already exists for this email'
      });
    }

    // Create beta access request
    const betaRequest = new BetaAccessRequest({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      designFirmLocation: designFirmLocation.trim(),
      roleDesignFocus: roleDesignFocus.trim(),
      curiosity: curiosity.trim(),
      howHeard: howHeard.trim(),
      status: 'pending',
    });

    await betaRequest.save();

    res.status(201).json({
      success: true,
      message: 'Beta access request submitted successfully. You will be notified once reviewed.'
    });
  } catch (error) {
    console.error('Beta request error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
