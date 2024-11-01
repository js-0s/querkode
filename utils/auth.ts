export default function auth(request) {
  if (process.env.AUTH_NONE === 'YES') {
    return;
  }
  const authorization = request.headers['Authorization'];
  if (
    typeof authorization !== 'string' ||
    !authorization.startsWith('Bearer:')
  ) {
    throw new Error('bad authorization');
  }
  const bearer = authorization.replace(/^bearer: /, '');
  if (bearer !== process.env.AUTH_BEARER) {
    throw new Error('invalid authorization');
  }
}
