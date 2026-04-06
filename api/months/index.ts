import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAllMonths, getOrCreateMonth } from '../src/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const months = await getAllMonths();
      res.status(200).json(months);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch months' });
    }
  } else if (req.method === 'POST') {
    if (req.url?.endsWith('/current')) {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const currentMonth = await getOrCreateMonth(year, month);
        res.status(200).json(currentMonth);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create current month' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}