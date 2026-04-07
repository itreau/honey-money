import '../_init';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_auth';
import { getAllMonths } from '../../src/db';

export default withAuth(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === 'GET') {
    try {
      const months = await getAllMonths();
      res.status(200).json(months);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch months' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
});