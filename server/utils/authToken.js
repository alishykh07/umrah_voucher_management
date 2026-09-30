import jwt from 'jsonwebtoken';

const isProduction = process.env.NODE_ENV === 'production';
const SESSION_DAYS = 30;
const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60 * 1000;

export const createAuthToken = (userId) => jwt.sign(
  { sub: userId },
  process.env.JWT_SECRET,
  { expiresIn: '30d' },
);

export const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: SESSION_MAX_AGE,
  path: '/',
};

export const clearCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
};