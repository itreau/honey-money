import '../_init';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_auth';
import { getOrCreateMonth } from '../../src/db';

export default withAuth(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === 'POST') {
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
});