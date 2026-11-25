import fs from 'fs';

const TMP_CUSTOMERS_FILE = '/tmp/sazib_registered_customers.json';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    let list = [];
    if (fs.existsSync(TMP_CUSTOMERS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(TMP_CUSTOMERS_FILE, 'utf8'));
      if (Array.isArray(parsed)) list = parsed;
    }
    return res.status(200).json(list);
  } catch {
    return res.status(200).json([]);
  }
}
