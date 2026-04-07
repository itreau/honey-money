import '../../_init';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../../_auth';
import { getLatestPay } from '../../../src/db';

export default withAuth(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === 'GET') {
    try {
      const pay = await getLatestPay();
      res.status(200).json(pay);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch latest pay' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
});