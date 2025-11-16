import { JWTPayload } from '../lib/auth';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload & {
        id: string;
      };
    }
    
    interface Session {
      returnTo?: string;
    }
  }
}

export {};
