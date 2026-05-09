import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/prisma.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, password } = req.body;

  try {
    // Basic check for the initial admin if no users exist
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      if (username === 'admin' && password === 'Ndf41847034@') {
        const admin = await prisma.user.create({
          data: {
            username: 'admin',
            password: 'Ndf41847034@', // In a real app, use hashing!
            role: 'admin'
          }
        });
        return res.status(200).json({ id: admin.id, username: admin.username, role: admin.role });
      }
    }

    const user = await prisma.user.findFirst({
      where: { username, password } // In a real app, use bcrypt!
    });

    if (user) {
      return res.status(200).json({ id: user.id, username: user.username, role: user.role });
    }

    return res.status(401).json({ error: 'Credenciales inválidas' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
