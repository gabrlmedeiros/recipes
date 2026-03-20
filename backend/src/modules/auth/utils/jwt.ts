import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env['JWT_SECRET'] ?? 'dev_secret';

export function signToken(userId: string | number) {
  const expiresIn = (process.env['JWT_EXPIRES_IN'] ?? '7d') as jwt.SignOptions['expiresIn'];
  const sub = String(userId);
  return jwt.sign({ sub }, JWT_SECRET, { expiresIn });
}
