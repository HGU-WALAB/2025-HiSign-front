import axios from 'axios';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { hisnetToken } = req.body;
    const response = await axios.post(`${process.env.API_BASE_URL}/auth/login`, { hisnetToken });
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to authenticate', error: error.message });
  }
}