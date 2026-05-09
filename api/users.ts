import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/prisma.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Authentication check would go here in a real app
  
  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany({
        select: { id: true, username: true, role: true, createdAt: true }
      });
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { username, password, role } = req.body;
      const newUser = await prisma.user.create({
        data: { username, password, role },
        select: { id: true, username: true, role: true, createdAt: true }
      });
      return res.status(201).json(newUser);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create user' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      await prisma.user.delete({
        where: { id: String(id) }
      });
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
