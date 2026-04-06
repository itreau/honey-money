import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAvailableYears } from '../src/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const years = await getAvailableYears();
      res.status(200).json(years);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch years' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}