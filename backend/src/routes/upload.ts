import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { put } from '@vercel/blob';
import multer from 'multer';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  },
});

interface AuthRequest extends Request {
  user?: any;
}

// Upload profile picture
router.post('/profile', authenticate, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const blob = await put(`users/${userId}/profile-${Date.now()}.${req.file.mimetype.split('/')[1]}`, req.file.buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Update user avatar in database
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: blob.url },
    });

    return res.json({
      success: true,
      url: blob.url,
      message: 'Profile picture updated successfully',
    });
  } catch (error: any) {
    console.error('Profile upload error:', error);
    return res.status(500).json({ 
      message: error.message || 'Failed to upload profile picture' 
    });
  }
});

// Upload business logo
router.post('/business-logo', authenticate, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get user's business
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedBusiness: true,
        business: true,
      },
    });

    const business = user?.ownedBusiness || user?.business;

    if (!business) {
      return res.status(403).json({ message: 'No business found' });
    }

    const blob = await put(`businesses/${business.id}/logo-${Date.now()}.${req.file.mimetype.split('/')[1]}`, req.file.buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Update business logo in database
    await prisma.business.update({
      where: { id: business.id },
      data: { logo: blob.url },
    });

    return res.json({
      success: true,
      url: blob.url,
      message: 'Business logo updated successfully',
    });
  } catch (error: any) {
    console.error('Business logo upload error:', error);
    return res.status(500).json({ 
      message: error.message || 'Failed to upload business logo' 
    });
  }
});

// Upload booking page cover
router.post('/booking-cover', authenticate, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get user's business
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedBusiness: true,
        business: true,
      },
    });

    const business = user?.ownedBusiness || user?.business;

    if (!business) {
      return res.status(403).json({ message: 'No business found' });
    }

    const blob = await put(`businesses/${business.id}/booking-cover-${Date.now()}.${req.file.mimetype.split('/')[1]}`, req.file.buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Update booking page settings with cover image
    await prisma.bookingPageSettings.upsert({
      where: { businessId: business.id },
      update: { coverImage: blob.url },
      create: {
        businessId: business.id,
        coverImage: blob.url,
      },
    });

    return res.json({
      success: true,
      url: blob.url,
      message: 'Booking page cover updated successfully',
    });
  } catch (error: any) {
    console.error('Booking cover upload error:', error);
    return res.status(500).json({ 
      message: error.message || 'Failed to upload booking cover' 
    });
  }
});

export default router;
