import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/prisma.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const recipes = await prisma.recipe.findMany({
        include: {
          ingredients: {
            include: {
              stockItem: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.status(200).json(recipes);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch recipes' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, preparation, ingredients } = req.body;
      
      const newRecipe = await prisma.recipe.create({
        data: {
          name,
          preparation,
          ingredients: {
            create: ingredients.map((ing: any) => ({
              stockItemId: ing.stockItemId,
              quantity: Number(ing.quantity)
            }))
          }
        },
        include: {
          ingredients: {
            include: {
              stockItem: true
            }
          }
        }
      });
      return res.status(201).json(newRecipe);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to create recipe' });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
