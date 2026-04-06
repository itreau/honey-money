import type { VercelRequest, VercelResponse } from '@vercel/node';
import { addExpense, getOrCreateMonth, getMonthById } from '../../../../src/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
  
  if (req.method === 'POST') {
    try {
      let monthEntry;
      if (sheetId && typeof sheetId === 'string') {
        monthEntry = await getMonthById(parseInt(sheetId, 10));
      } else {
        monthEntry = await getOrCreateMonth(yearNum, monthNum);
      }
      
      if (!monthEntry) {
        return res.status(404).json({ error: 'Sheet not found' });
      }
      
      const expense = await addExpense(monthEntry.id);
      res.status(201).json(expense);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add expense' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}