import type { NextApiRequest, NextApiResponse } from 'next';
type Data = {
  name: string;
};
import auth from '@/utils/auth';
import qr from 'qrcode';
import sharp from 'sharp';

// magic constants:
const compositeSize = 546;
const defaultResultSize = 256;
const defaultResultFormat = 'png';
const overlayPath = '/app/public/overlays/';
// selection of https://sharp.pixelplumbing.com/api-output#toformat
const supportedFormats = ['png', 'jpeg', 'webp'];

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
    const {
      key, // key to generate (baseurl in prefixed
      format, // output format png,jpeg
      size, // size in pixel
      overlay, // add a overlay in the center of the qr-code
      uppercase, // make qr-code more error-resistant by uppercasing the url
    } = query;
    if (typeof key !== 'string' || !key.length) {
      throw new Error('please provide a nonempty key');
    }

    const resultFormat = format ?? defaultResultFormat;
    const resultSize = isNaN(parseInt(size))
      ? defaultResultSize
      : parseInt(size);
    if (!supportedFormats.includes(resultFormat)) {
      throw new Error('bad format requested');
    }
    if (resultSize < 64) {
      throw new Error('bad size requested');
    }
    // the URL-prefix makes this a url for the receivers
    const qrCodeUrl = `URL:${process.env.NEXT_PUBLIC_HOST}/${key}`;

    // generate the QR-code
    const qrDataUrl = await qr.toDataURL(
      uppercase ? qrCodeUrl.toUpperCase() : qrCodeUrl,
      {
        errorCorrectionLevel: 'H',
      },
    );
    // extract the png image data
    const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Uint8Array.from(atob(qrBase64), (c) => c.charCodeAt(0));

    // image manipulation
    // may be extended further for coloring
    const overlayQRCode = new sharp(imageBuffer);
    if (overlay) {
      // scale the qr-code so the overlay position/size is predictable
      overlayQRCode.resize(compositeSize, compositeSize);
      if (typeof overlay !== 'string' || overlay.match(/\./)) {
        throw new Error('invalid overlay');
      }
      overlayQRCode.composite([
        { input: `${overlayPath}${overlay}.png`, gravity: 'center' },
      ]);
    }
    // compile the final image from the overlay, scale to requested size and format
    const resultQrCode = new sharp(await overlayQRCode.toBuffer());
    resultQrCode.resize(resultSize, resultSize);
    resultQrCode.toFormat(resultFormat);
    const resultBuffer = await resultQrCode.toBuffer();

    // http response
    res.writeHead(200, {
      'Content-Type': `image/${resultFormat}`,
    });
    res.write(resultBuffer);
    res.end();
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
}
