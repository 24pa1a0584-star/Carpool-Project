import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { PlatformSettings } from '../models/PlatformSettings';
import { env } from '../config/env';

export const initAdmin = async (): Promise<void> => {
  try {
    // 1. Initialize platform settings idempotently
    const settingsCount = await PlatformSettings.countDocuments();
    if (settingsCount === 0) {
      await PlatformSettings.create({
        appName: 'RouteBloom',
        maintenanceMode: false,
        allowInstantBooking: true,
        platformFeePercentage: 0,
        contactEmail: 'support@routebloom.com',
      });
      console.log('⚙️ Platform settings initialized.');
    }

    // 2. Check if setup is enabled
    if (!env.INITIAL_SETUP_ENABLED) {
      return;
    }

    // Check if ANY admin already exists in the system
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      // Never overwrite an existing administrator
      return;
    }

    const email = env.BOOTSTRAP_ADMIN_EMAIL.trim().toLowerCase();
    const name = env.BOOTSTRAP_ADMIN_NAME.trim();
    const rawPassword = env.BOOTSTRAP_ADMIN_PASSWORD;

    if (!rawPassword || rawPassword.length < 8) {
      console.warn('⚠️ Bootstrap admin password must be at least 8 characters. Admin creation skipped.');
      return;
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    // Create super administrator account
    await User.create({
      name,
      email,
      passwordHash,
      role: 'admin',
      city: 'Vijayawada',
      bio: 'RouteBloom Platform Super Administrator',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    console.log(`🛡️ Super Admin bootstrapped successfully: ${email} (Password hashed securely)`);
  } catch (error) {
    console.error('❌ Error during admin bootstrap:', error);
  }
};
