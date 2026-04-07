import '../../_init';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../../_auth';
import { deleteSheet } from '../../../src/db';

export default withAuth(async (req: VercelRequest, res: VercelResponse) => {
  const { id } = req.query;
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  
  const sheetId = id;

  if (req.method === 'DELETE') {
    try {
      await deleteSheet(sheetId);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete sheet' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
});