'use server';

import { prisma } from '@/lib/prisma';
import { RegisterSchema } from '@/lib/validations';
import bcrypt from 'bcrypt';

export async function registerUser(input) {
  try {
    const validation = RegisterSchema.safeParse(input);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Invalid input data',
      };
    }

    const { name, email, password, role, companyName } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return {
        success: false,
        error: 'A user with this email address already exists.',
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Save travel owner metadata in global registry
    if (role === 'TRAVEL_OWNER') {
      const globalStore = globalThis;
      if (!globalStore.__TRAVEL_OWNERS__) globalStore.__TRAVEL_OWNERS__ = {};
      globalStore.__TRAVEL_OWNERS__[normalizedEmail] = {
        name,
        companyName: companyName || name,
        registeredAt: new Date().toISOString(),
      };
    }

    // Persist to database (fallback role to USER if Prisma schema doesn't have TRAVEL_OWNER enum)
    try {
      await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          password: hashedPassword,
          role: role === 'TRAVEL_OWNER' ? 'USER' : role,
        },
      });
    } catch (dbErr) {
      console.error('Prisma user create error, retrying as USER role:', dbErr);
      await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          password: hashedPassword,
          role: 'USER',
        },
      });
    }

    return {
      success: true,
      message: 'Registration successful! You can now log in.',
    };
  } catch (err) {
    console.error('Registration error:', err);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}
