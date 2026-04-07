import '../../../_init';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../../../_auth';
import { getSheetsByYearMonth, createSheet, createSheetFromPrevious, getExpensesByMonthId } from '../../../../src/db';

export default withAuth(async (req: VercelRequest, res: VercelResponse) => {
  const { year, month } = req.query;
  
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

      const expenses = await getExpensesByMonthId(sheet.id);
      res.status(201).json({ month: sheet, expenses });
    } catch (error) {
      console.error('Error creating sheet:', error);
      res.status(500).json({ error: 'Failed to create sheet', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
});