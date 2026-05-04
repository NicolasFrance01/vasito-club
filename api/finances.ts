import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/prisma.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const finances = await prisma.financeRecord.findMany({
        include: { stockItem: true },
        orderBy: { date: 'desc' },
      });
      return res.status(200).json(finances);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch finances' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { date, ingredientId, quantityAdded, totalCost } = req.body;
      
      const newRecord = await prisma.financeRecord.create({
        data: {
          date: new Date(date),
          ingredientId,
          quantityAdded,
          totalCost,
        },
      });

      // Automatically update stock
      await prisma.stockItem.update({
        where: { id: ingredientId },
        data: { quantity: { increment: quantityAdded } },
      });

      return res.status(201).json(newRecord);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create finance record' });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
