import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/prisma.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const catalog = await prisma.catalogItem.findMany();
      return res.status(200).json(catalog);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch catalog' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, coverImage, carouselImages, ingredients, price, promos } = req.body;
      const newItem = await prisma.catalogItem.create({
        data: { name, coverImage, carouselImages: carouselImages || [], ingredients, price, promos },
      });
      return res.status(201).json(newItem);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create catalog item' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, name, coverImage, carouselImages, ingredients, price, promos } = req.body;
      const updatedItem = await prisma.catalogItem.update({
        where: { id },
        data: { name, coverImage, carouselImages, ingredients, price, promos },
      });
      return res.status(200).json(updatedItem);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update catalog item' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'ID is required' });
      }
      await prisma.catalogItem.delete({
        where: { id },
      });
      return res.status(200).json({ message: 'Item deleted' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete catalog item' });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
