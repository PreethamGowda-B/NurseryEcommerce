import prisma from '../db/client.js';
import { logger } from '../utils/logger.js';

export interface AuditParams {
  adminId: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

export class AuditService {
  /**
   * Record admin activity in AuditLog table without storing sensitive credentials
   */
  static async log(params: AuditParams): Promise<void> {
    try {
      // Strip sensitive parameters if any
      const safeMetadata = params.metadata ? { ...params.metadata } : {};
      delete safeMetadata.password;
      delete safeMetadata.passwordHash;
      delete safeMetadata.token;
      delete safeMetadata.secret;

      await prisma.auditLog.create({
        data: {
          adminId: params.adminId,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          metadata: JSON.stringify(safeMetadata),
          ipAddress: params.ipAddress || null,
        },
      });

      logger.info(
        `AuditLog [${params.action}] by admin ${params.adminId} on ${params.entity}:${params.entityId}`
      );
    } catch (err) {
      logger.error('Failed to create AuditLog record:', err);
    }
  }
}
