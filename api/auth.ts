import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/prisma.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, password } = req.body;

  try {
    // Check if the admin user exists
    let admin = await prisma.user.findUnique({
      where: { username: 'admin' }
    });
    
    // If admin doesn't exist and credentials match the magic ones, create it
    if (!admin && username === 'admin' && password === 'Ndf41847034@') {
      admin = await prisma.user.create({
        data: {
          username: 'admin',
          password: 'Ndf41847034@',
          role: 'admin'
        }
      });
    }

    const user = await prisma.user.findFirst({
      where: { username, password }
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
