import type { VercelRequest, VercelResponse } from '@vercel/node';
import { deleteSheet } from '../../../src/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid parameters' });
  }
  
  const idNum = parseInt(id, 10);
  
  if (isNaN(idNum)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  
  if (req.method === 'DELETE') {
    try {
      await deleteSheet(idNum);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete sheet' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}