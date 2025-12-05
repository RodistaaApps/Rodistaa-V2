/**
 * Admin Authentication & Authorization Middleware
 * 
 * Provides JWT-based authentication and RBAC enforcement for admin routes.
 * All admin actions are logged and permissions are checked against roles.json.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import roles from '../../config/roles.json';

// Extend Express Request to include admin user
export interface AdminRequest extends Request {
  admin?: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

/**
 * JWT payload structure
 */
interface JWTPayload {
  adminId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Get JWT secret from environment
 */
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'rodistaa-admin-secret-change-in-production';
const JWT_EXPIRY = process.env.ADMIN_JWT_EXPIRY || '1h';

/**
 * Authenticate admin user via JWT token
 * Expects: Authorization: Bearer <token>
 */
export const authenticateAdmin = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify and decode JWT
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // TODO: Query database to verify admin still exists and is active
    // const admin = await db.query('SELECT * FROM admin_users WHERE id = $1 AND status = $2', [decoded.adminId, 'active']);
    // if (!admin) throw new Error('Admin not found or inactive');

    // Get permissions for this role
    const roleConfig = roles.roles[decoded.role as keyof typeof roles.roles];
    if (!roleConfig) {
      res.status(403).json({ error: 'Invalid role' });
      return;
    }

    // Attach admin info to request
    req.admin = {
      id: decoded.adminId,
      email: decoded.email,
      role: decoded.role,
      permissions: roleConfig.permissions,
    };

    // TODO: Update last_login_at and last_login_ip in database
    // await db.query('UPDATE admin_users SET last_login_at = NOW(), last_login_ip = $1 WHERE id = $2', [req.ip, decoded.adminId]);

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ error: 'Invalid token' });
    } else {
      res.status(500).json({ error: 'Authentication failed', details: error.message });
    }
  }
};

/**
 * Require specific permission(s)
 * Usage: requirePermission('trucks:block')
 * Usage: requirePermission(['trucks:block', 'trucks:unblock'])
 */
export const requirePermission = (
  requiredPermissions: string | string[]
) => {
  return (req: AdminRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const permissions = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions];

    const hasPermission = permissions.every(perm => 
      req.admin!.permissions.includes(perm)
    );

    if (!hasPermission) {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permissions,
        role: req.admin.role,
      });
      return;
    }

    next();
  };
};

/**
 * Require specific role(s)
 * Usage: requireRole('SuperAdmin')
 * Usage: requireRole(['SuperAdmin', 'ComplianceOfficer'])
 */
export const requireRole = (
  requiredRoles: string | string[]
) => {
  return (req: AdminRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    if (!allowedRoles.includes(req.admin.role)) {
      res.status(403).json({ 
        error: 'Insufficient role',
        required: allowedRoles,
        current: req.admin.role,
      });
      return;
    }

    next();
  };
};

/**
 * Generate JWT token for admin user
 * Used during login
 */
export const generateAdminToken = (admin: { id: string; email: string; role: string }): string => {
  const payload: JWTPayload = {
    adminId: admin.id,
    email: admin.email,
    role: admin.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

/**
 * Generate refresh token (longer expiry)
 */
export const generateRefreshToken = (admin: { id: string; email: string; role: string }): string => {
  const payload: JWTPayload = {
    adminId: admin.id,
    email: admin.email,
    role: admin.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Verify refresh token and generate new access token
 */
export const refreshAccessToken = (refreshToken: string): string | null => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as JWTPayload;
    
    // Generate new access token
    return generateAdminToken({
      id: decoded.adminId,
      email: decoded.email,
      role: decoded.role,
    });
  } catch (error) {
    return null;
  }
};

/**
 * Check if user has permission for a specific action
 * Can be used programmatically in controllers
 */
export const hasPermission = (admin: AdminRequest['admin'], permission: string): boolean => {
  if (!admin) return false;
  return admin.permissions.includes(permission);
};

/**
 * Check if permission requires reason
 */
export const requiresReason = (permission: string): boolean => {
  const permConfig = roles.permissions[permission as keyof typeof roles.permissions];
  return permConfig?.requires_reason || false;
};

/**
 * Check if permission creates audit log
 */
export const createsAudit = (permission: string): boolean => {
  const permConfig = roles.permissions[permission as keyof typeof roles.permissions];
  return permConfig?.creates_audit || false;
};

/**
 * Middleware to enforce 2FA for SuperAdmin
 * TODO: Implement TOTP verification
 */
export const require2FA = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.admin) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  if (req.admin.role === 'SuperAdmin') {
    // TODO: Verify TOTP token from request header
    // const totpToken = req.headers['x-totp-token'];
    // if (!totpToken || !verifyTOTP(req.admin.id, totpToken)) {
    //   res.status(403).json({ error: '2FA required' });
    //   return;
    // }
  }

  next();
};

/**
 * Rate limiting per admin user
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export const adminRateLimit = (maxRequests: number = 100, windowMs: number = 60000) => {
  return (req: AdminRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      next();
      return;
    }

    const now = Date.now();
    const key = `${req.admin.id}:${req.path}`;
    const limit = rateLimitStore.get(key);

    if (!limit || now > limit.resetAt) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (limit.count >= maxRequests) {
      res.status(429).json({ 
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((limit.resetAt - now) / 1000),
      });
      return;
    }

    limit.count++;
    next();
  };
};

/**
 * Extract admin context for logging
 */
export const getAdminContext = (req: AdminRequest) => {
  return {
    adminId: req.admin?.id || 'anonymous',
    adminRole: req.admin?.role || 'none',
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    path: req.path,
    method: req.method,
  };
};

export default {
  authenticateAdmin,
  requirePermission,
  requireRole,
  generateAdminToken,
  generateRefreshToken,
  refreshAccessToken,
  hasPermission,
  requiresReason,
  createsAudit,
  require2FA,
  adminRateLimit,
  getAdminContext,
};

