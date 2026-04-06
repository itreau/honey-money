import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTemplates } from '../../src/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const templates = await getTemplates();
      res.status(200).json(templates);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}