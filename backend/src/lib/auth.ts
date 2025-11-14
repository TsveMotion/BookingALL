import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { config } from '../config';
import prisma from './prisma';

export interface JWTPayload {
  userId: string;
  email: string;
  businessId: string | null;
  role: string;
  category: string | null;
}

export interface TokenPair {
  token: string;
  refreshToken: string;
  expiresAt: Date;
  refreshExpiresAt: Date;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

// Generate refresh token
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, config.jwt.secret) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Verify refresh token
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Create session in database
export async function createSession(
  userId: string,
  userAgent?: string,
  ipAddress?: string
): Promise<TokenPair> {
  // Get user with business info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      business: {
        select: {
          id: true,
          category: true,
        },
      },
      ownedBusiness: {
        select: {
          id: true,
          category: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Determine business ID and category
  const businessId = user.businessId || user.ownedBusiness?.id || null;
  const category = user.business?.category || user.ownedBusiness?.category || null;

  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    businessId,
    role: user.role,
    category,
  };

  const token = generateToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Token expires in 15 minutes
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  // Refresh token expires in 7 days
  const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Store session in database
  await prisma.session.create({
    data: {
      userId,
      token,
      refreshToken,
      expiresAt,
      refreshExpiresAt,
      userAgent,
      ipAddress,
    },
  });

  // Update last login
  await prisma.user.update({
    where: { id: userId },
    data: {
      lastLoginAt: new Date(),
      lastActiveAt: new Date(),
    },
  });

  return { token, refreshToken, expiresAt, refreshExpiresAt };
}

// Refresh session
export async function refreshSession(refreshToken: string): Promise<TokenPair | null> {
  // Verify refresh token
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    return null;
  }

  // Check if session exists in database
  const session = await prisma.session.findUnique({
    where: { refreshToken },
  });

  if (!session || session.refreshExpiresAt < new Date()) {
    return null;
  }

  // Delete old session
  await prisma.session.delete({
    where: { id: session.id },
  });

  // Create new session
  return createSession(payload.userId);
}

// Revoke session
export async function revokeSession(token: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { token },
  });
}

// Generate verification token
export async function generateVerificationToken(userId: string): Promise<string> {
  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.verificationToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

// Generate password reset token
export async function generatePasswordResetToken(userId: string): Promise<string> {
  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

// Get dashboard URL based on business category
export function getDashboardUrl(category: string | null): string {
  if (!category) {
    return config.frontendUrls.main;
  }

  const categoryMap: Record<string, string> = {
    BEAUTICIAN: config.frontendUrls.beauticians,
    HAIRDRESSER: config.frontendUrls.hairdressers,
    BARBER: config.frontendUrls.barbers,
  };

  return categoryMap[category] || config.frontendUrls.main;
}
