import './_init';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from './_auth';
import { getTemplates } from '../src/db';

export default withAuth(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === 'GET') {
    try {
      const templates = await getTemplates();
      res.status(200).json(templates);
    } catch (error: unknown) {
      const err = error as { message?: string; error?: string; details?: string };
      res.status(500).json({ 
        error: 'Failed to fetch templates', 
        details: err.message || err.error || err.details || JSON.stringify(error)
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
});