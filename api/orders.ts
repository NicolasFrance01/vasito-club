import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/prisma.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const orders = await prisma.order.findMany({
        include: { items: true },
        orderBy: { date: 'desc' },
      });
      return res.status(200).json(orders);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { customerName, phone, address, notes, delivery, deliveryCost, date, paymentMethod, status, paymentStatus, total, items, userId, username } = req.body;

      const newOrder = await prisma.order.create({
        data: {
          customerName,
          phone,
          address,
          notes,
          delivery,
          deliveryCost,
          date: new Date(date),
          paymentMethod,
          status,
          paymentStatus: paymentStatus || 'Pendiente de pago',
          total,
          createdById: userId,
          createdByUsername: username,
          items: {
            create: items.map((item: any) => ({
              catalogId: item.catalogId,
              quantity: item.quantity,
            })),
          },
          history: {
            create: {
              status: status || 'Pendiente',
              userId,
              username,
              date: new Date()
            }
          }
        },
        include: { items: true, history: true },
      });

      // Handle auto customer creation
      if (phone) {
        await prisma.customer.upsert({
          where: { phone },
          update: { ordersCount: { increment: 1 } },
          create: { name: customerName, phone, ordersCount: 1 },
        });
      }

      return res.status(201).json(newOrder);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to create order' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { id, status, paymentStatus, userId, username } = req.body;
      const data: any = {};
      if (status !== undefined) {
        data.status = status;
        data.history = { create: { status, userId, username, date: new Date() } };
      }
      if (paymentStatus !== undefined) {
        data.paymentStatus = paymentStatus;
      }
      const updatedOrder = await prisma.order.update({
        where: { id: String(id) },
        data,
        include: { items: true, history: true },
      });
      return res.status(200).json(updatedOrder);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to update order status' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, customerName, phone, address, notes, delivery, deliveryCost, date, paymentMethod, status, paymentStatus, total, items } = req.body;

      await prisma.orderItem.deleteMany({
        where: { orderId: String(id) }
      });

      const updatedOrder = await prisma.order.update({
        where: { id: String(id) },
        data: {
          customerName,
          phone,
          address,
          notes,
          delivery,
          deliveryCost,
          date: new Date(date),
          paymentMethod,
          status,
          paymentStatus: paymentStatus || 'Pendiente de pago',
          total,
          items: {
            create: items.map((item: any) => ({
              catalogId: item.catalogId,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      return res.status(200).json(updatedOrder);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to update order' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      await prisma.orderItem.deleteMany({
        where: { orderId: String(id) }
      });
      await prisma.order.delete({
        where: { id: String(id) }
      });
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete order' });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
