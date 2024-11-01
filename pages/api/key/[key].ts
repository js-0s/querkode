import type { NextApiRequest, NextApiResponse } from 'next';
type Data = {
  name: string;
};
import db from '@/utils/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  try {
    const headers = req.headers;
    const query = req.query;
    const ua = `${headers['user-agent']} ${headers['sec-ch-ua']}`;
    const remote = headers['x-forwarded-for'];
    const { key } = query;
    const url = await db.dynamicUrl.findUnique({ where: { key } });
    if (!url) {
      res.status(404);
      res.end();
      return;
    }
    await db.statistics.create({
      data: {
        url: { connect: { id: url.id } },
        ua,
        ip: remote,
        rawHeaders: headers,
      },
    });
    res.redirect(301, url.destination);
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
  console.log('end');
}
