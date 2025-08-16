import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(
    payload,
    config.jwt.secret,
    {
      expiresIn: config.jwt.accessTokenExpiry,
      issuer: 'bookstore-api',
      audience: 'bookstore-users'
    } as jwt.SignOptions
  );
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(payload: Pick<JwtPayload, 'userId'>): string {
  return jwt.sign(
    payload,
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshTokenExpiry,
      issuer: 'bookstore-api',
      audience: 'bookstore-users'
    } as jwt.SignOptions
  );
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(payload: JwtPayload): TokenPair {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken({ userId: payload.userId })
  };
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret, {
    issuer: 'bookstore-api',
    audience: 'bookstore-users'
  }) as JwtPayload;
}

/**
 * Verify JWT refresh token
 */
export function verifyRefreshToken(token: string): Pick<JwtPayload, 'userId'> {
  return jwt.verify(token, config.jwt.refreshSecret, {
    issuer: 'bookstore-api',
    audience: 'bookstore-users'
  }) as Pick<JwtPayload, 'userId'>;
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1] || null;
}
