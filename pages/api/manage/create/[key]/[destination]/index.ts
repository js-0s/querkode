import type { NextApiRequest, NextApiResponse } from 'next';
type Data = {
  name: string;
};
import db from '@/utils/prisma';
import auth from '@/utils/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  try {
    auth(req);
  } catch (error) {
    return res.status(403).json({ error: { message: error.message } });
  }

  try {
    const query = req.query;
    const { key, destination } = query;
    await db.dynamicUrl.create({ data: { key, destination } });
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
}
