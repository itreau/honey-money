import '../../../_init';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../../../_auth';
import { getExpensesByMonthId, getMonthByYearMonth, getMonthById } from '../../../../src/db';

export default withAuth(async (req: VercelRequest, res: VercelResponse) => {
  const { year, month } = req.query;
  const { sheetId } = req.query;
  
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
      let monthEntry;
      if (sheetId && typeof sheetId === 'string') {
        monthEntry = await getMonthById(parseInt(sheetId, 10));
      } else {
        monthEntry = await getMonthByYearMonth(yearNum, monthNum);
      }
      
      if (!monthEntry) {
        return res.status(200).json({ expenses: [], monthExists: false, sheet: null });
      }
      
      const expenses = await getExpensesByMonthId(monthEntry.id);
      res.status(200).json({ expenses, monthExists: true, sheet: monthEntry });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch expenses' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
});
  
  const yearNum = parseInt(year, 10);
  const monthNum = parseInt(month, 10);
  
  if (isNaN(yearNum) || isNaN(monthNum)) {
    return res.status(400).json({ error: 'Invalid year or month' });
  }
  
  if (req.method === 'GET') {
    try {
      let monthEntry;
      if (sheetId && typeof sheetId === 'string') {
        monthEntry = await getMonthById(parseInt(sheetId, 10));
      } else {
        monthEntry = await getMonthByYearMonth(yearNum, monthNum);
      }
      
      if (!monthEntry) {
        return res.status(200).json({ expenses: [], monthExists: false, sheet: null });
      }
      
      const expenses = await getExpensesByMonthId(monthEntry.id);
      res.status(200).json({ expenses, monthExists: true, sheet: monthEntry });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch expenses' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}