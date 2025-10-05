import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method Not Allowed' });

  const url = process.env.MARKETING_WEBHOOK_URL;
  if (!url) return res.status(500).json({ success: false, error: 'MARKETING_WEBHOOK_URL not configured' });

  try {
    await axios.post(url, req.body, { timeout: 8000 });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}
