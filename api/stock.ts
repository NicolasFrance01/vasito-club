import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const stock = await prisma.stockItem.findMany();
      return res.status(200).json(stock);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch stock' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, quantity, unit, minQuantity } = req.body;
      const newItem = await prisma.stockItem.create({
        data: { name, quantity, unit, minQuantity },
      });
      return res.status(201).json(newItem);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create stock item' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { id, quantity } = req.body;
      const updatedItem = await prisma.stockItem.update({
        where: { id: String(id) },
        data: { quantity },
      });
      return res.status(200).json(updatedItem);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update stock' });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
