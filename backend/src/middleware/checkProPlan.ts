import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
  business?: any;
}

export const checkProPlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        ownedBusiness: true,
        business: true,
      },
    });

    // Check if user owns a business or is part of one
    const business = user?.ownedBusiness || user?.business;

    if (!business) {
      return res.status(403).json({ 
        message: 'No business found',
        upgradeRequired: true,
      });
    }

    // Check if business has PRO plan
    const isPro = business.plan === 'PRO' || business.plan === 'ENTERPRISE';

    if (!isPro) {
      return res.status(403).json({
        message: 'This feature is only available for PRO plan members',
        currentPlan: business.plan,
        upgradeRequired: true,
      });
    }

    // Attach business to request for use in route handlers
    req.business = business;
    return next();
  } catch (error) {
    console.error('Error checking PRO plan:', error);
    return res.status(500).json({ message: 'Failed to verify plan status' });
  }
};
