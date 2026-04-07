import './_init';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from './_auth';
import { getAvailableYears } from '../src/db';

export default withAuth(async (req: VercelRequest, res: VercelResponse) => {
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
});