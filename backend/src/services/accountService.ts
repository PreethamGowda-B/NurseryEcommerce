import prisma from '../db/client.js';
import { NotFoundError } from '../utils/errors.js';

export interface UpdateProfileParams {
  name?: string;
  phone?: string;
}

export interface CreateAddressParams {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  label?: 'HOME' | 'WORK' | 'OTHER';
  landmark?: string;
}

export interface UpdateAddressParams {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  label?: 'HOME' | 'WORK' | 'OTHER';
  landmark?: string;
}

export class AccountService {
  /**
   * Get safe customer profile (strips passwordHash)
   */
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    return user;
  }

  /**
   * Update profile (name, phone). Email is read-only.
   */
  static async updateProfile(userId: string, params: UpdateProfileParams) {
    const updateData: any = {};
    if (params.name !== undefined) updateData.name = params.name.trim();
    if (params.phone !== undefined) updateData.phone = params.phone.trim();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Get all addresses owned by authenticated customer
   */
  static async getAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Create address. Automatically sets first address as default in a transaction.
   */
  static async createAddress(userId: string, data: CreateAddressParams) {
    return prisma.$transaction(async (tx) => {
      const addressCount = await tx.address.count({
        where: { userId },
      });

      const isFirst = addressCount === 0;

      const addressData: any = {
        userId,
        fullName: data.fullName.trim(),
        name: data.fullName.trim(),
        phone: data.phone.trim(),
        addressLine1: data.addressLine1.trim(),
        addressLine2: data.addressLine2 ? data.addressLine2.trim() : null,
        city: data.city.trim(),
        state: data.state.trim(),
        postalCode: data.postalCode.trim(),
        country: data.country ? data.country.trim() : 'India',
        label: data.label || 'HOME',
        landmark: data.landmark ? data.landmark.trim() : null,
        isDefault: isFirst,
      };

      const newAddress = await tx.address.create({
        data: addressData,
      });

      return newAddress;
    });
  }

  /**
   * Update existing address with IDOR ownership check
   */
  static async updateAddress(userId: string, addressId: string, data: UpdateAddressParams) {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existing) {
      throw new NotFoundError('Address not found');
    }

    const updateData: any = {};
    if (data.fullName !== undefined) {
      updateData.fullName = data.fullName.trim();
      updateData.name = data.fullName.trim();
    }
    if (data.phone !== undefined) updateData.phone = data.phone.trim();
    if (data.addressLine1 !== undefined) updateData.addressLine1 = data.addressLine1.trim();
    if (data.addressLine2 !== undefined) updateData.addressLine2 = data.addressLine2 ? data.addressLine2.trim() : null;
    if (data.city !== undefined) updateData.city = data.city.trim();
    if (data.state !== undefined) updateData.state = data.state.trim();
    if (data.postalCode !== undefined) updateData.postalCode = data.postalCode.trim();
    if (data.country !== undefined) updateData.country = data.country.trim();
    if (data.label !== undefined) updateData.label = data.label;
    if (data.landmark !== undefined) updateData.landmark = data.landmark ? data.landmark.trim() : null;

    return prisma.address.update({
      where: { id: addressId },
      data: updateData,
    });
  }

  /**
   * Delete address. If default address is deleted, automatically promotes newest remaining address.
   */
  static async deleteAddress(userId: string, addressId: string) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.address.findFirst({
        where: { id: addressId, userId },
      });

      if (!existing) {
        throw new NotFoundError('Address not found');
      }

      const wasDefault = existing.isDefault;

      await tx.address.delete({
        where: { id: addressId },
      });

      // Promote newest remaining address if default was deleted
      if (wasDefault) {
        const nextAddress = await tx.address.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });

        if (nextAddress) {
          await tx.address.update({
            where: { id: nextAddress.id },
            data: { isDefault: true },
          });
        }
      }

      return { success: true };
    });
  }

  /**
   * Transactionally set target address as default and reset others for user
   */
  static async setDefaultAddress(userId: string, addressId: string) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.address.findFirst({
        where: { id: addressId, userId },
      });

      if (!existing) {
        throw new NotFoundError('Address not found');
      }

      // Reset all user addresses to isDefault = false
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });

      // Set target address as default
      const updated = await tx.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      });

      return updated;
    });
  }
}
