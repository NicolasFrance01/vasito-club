import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/prisma.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const revisions = await prisma.stockRevision.findMany({
        orderBy: { date: 'desc' }
      });
      return res.status(200).json(revisions);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch revisions' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { items, notes } = req.body; // items is an array of { id, quantity }
      
      // Perform as a transaction
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create the revision record
        const revision = await tx.stockRevision.create({
          data: {
            date: new Date(),
            details: items,
            notes
          }
        });

        // 2. Update each stock item
        for (const item of items) {
          await tx.stockItem.update({
            where: { id: item.id },
            data: { quantity: item.quantity }
          });
        }

        return revision;
      });

      return res.status(201).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to save revision' });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
