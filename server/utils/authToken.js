import jwt from 'jsonwebtoken';

const isProduction = process.env.NODE_ENV === 'production';

export const createAuthToken = (userId) => jwt.sign(
  { sub: userId },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
);

export const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 86400000,
  path: '/',
};

export const clearCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
};