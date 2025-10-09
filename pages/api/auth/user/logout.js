export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // For JWT, logout is handled client-side by removing token
  // This endpoint can be used for any server-side cleanup if needed
  res.json({ success: true, message: 'Logged out successfully' });
}
