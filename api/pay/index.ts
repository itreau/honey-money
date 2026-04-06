import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createPay } from '../../src/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const body = req.body;
      const pay = await createPay(body.amount);
      res.status(201).json(pay);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create pay' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}