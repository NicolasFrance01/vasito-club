import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/prisma.js';

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
      const { id, name, quantity, unit, minQuantity } = req.body;
      const updatedItem = await prisma.stockItem.update({
        where: { id: String(id) },
        data: { 
          name: name !== undefined ? name : undefined,
          quantity: quantity !== undefined ? quantity : undefined,
          unit: unit !== undefined ? unit : undefined,
          minQuantity: minQuantity !== undefined ? minQuantity : undefined
        },
      });
      return res.status(200).json(updatedItem);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update stock' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      await prisma.stockItem.delete({
        where: { id: String(id) },
      });
      return res.status(200).json({ message: 'Stock item deleted' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete stock item' });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
