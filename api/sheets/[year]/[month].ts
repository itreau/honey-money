import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSheetsByYearMonth, createSheet, createSheetFromPrevious } from '../../../src/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const{ year, month } = req.query;
  
  if (typeof year !== 'string' || typeof month !== 'string') {
    return res.status(400).json({ error: 'Invalid parameters' });
  }
  
  const yearNum = parseInt(year, 10);
  const monthNum = parseInt(month, 10);
  
  if (isNaN(yearNum) || isNaN(monthNum)) {
    return res.status(400).json({ error: 'Invalid year or month' });
  }
  
  if (req.method === 'GET') {
    try {
      const sheets = await getSheetsByYearMonth(yearNum, monthNum);
      res.status(200).json(sheets);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch sheets' });
    }
  } else if (req.method === 'POST') {
    try {
      const body = req.body;
      const name = body?.name || 'Main';
      const copyFromMonthId = body?.copyFromMonthId ? parseInt(body.copyFromMonthId, 10) : null;
      
      let sheet;
      if (copyFromMonthId) {
        sheet = await createSheetFromPrevious(yearNum, monthNum, name, copyFromMonthId);
      } else {
        sheet = await createSheet(yearNum, monthNum, name);
      }
      
      res.status(201).json(sheet);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create sheet' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}