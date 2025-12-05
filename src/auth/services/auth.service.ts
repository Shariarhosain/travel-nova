import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, fullName, username, fcmToken, deviceName, platform } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.userAccount.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Only check username if provided
    if (username) {
      const existingUsername = await this.prisma.userProfile.findUnique({
        where: { username },
      });
      if (existingUsername) {
        throw new ConflictException('Username is already taken');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user account
    const user = await this.prisma.userAccount.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        profile: {
          create: {
            username: username || email.split('@')[0] + '_' + Date.now(),
          },
        },
        notificationSettings: {
          create: {},
        },
        accountSettings: {
          create: {},
        },
        privacySecuritySettings: {
          create: {},
        },
        statistics: {
          create: {},
        },
      },
      include: {
        profile: true,
      },
    });

    // Store device token if provided
    if (fcmToken && deviceName) {
      await this.storeDeviceToken(user.id, fcmToken, deviceName, platform);
    }

    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        username: user.profile?.username,
      },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password, fcmToken, deviceName, platform } = loginDto;

    const user = await this.prisma.userAccount.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.accountBanned) {
      throw new UnauthorizedException('Your account has been banned');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Store device token if provided
    if (fcmToken && deviceName) {
      await this.storeDeviceToken(user.id, fcmToken, deviceName, platform);
    }

    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        username: user.profile?.username,
        role: user.role,
      },
      token,
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.userAccount.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user || user.accountBanned) {
      return null;
    }

    return user;
  }

  async googleLogin(profile: any) {
    const email = profile.emails[0].value;
    
    let user = await this.prisma.userAccount.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      // Create new user from Google profile
      user = await this.prisma.userAccount.create({
        data: {
          email,
          fullName: profile.displayName,
          password: await bcrypt.hash(Math.random().toString(36), 10), // Random password
          profile: {
            create: {
              username: email.split('@')[0] + '_' + Date.now(),
              profileImage: profile.photos?.[0]?.value,
            },
          },
          notificationSettings: { create: {} },
          accountSettings: { create: {} },
          privacySecuritySettings: { create: {} },
          statistics: { create: {} },
        },
        include: { profile: true },
      });
    }

    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        username: user.profile?.username,
      },
      token,
    };
  }

  async facebookLogin(profile: any) {
    const email = profile.emails?.[0]?.value || `${profile.id}@facebook.com`;
    
    let user = await this.prisma.userAccount.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      user = await this.prisma.userAccount.create({
        data: {
          email,
          fullName: profile.displayName,
          password: await bcrypt.hash(Math.random().toString(36), 10),
          profile: {
            create: {
              username: (profile.displayName || 'user').replace(/\s+/g, '_').toLowerCase() + '_' + Date.now(),
              profileImage: profile.photos?.[0]?.value,
            },
          },
          notificationSettings: { create: {} },
          accountSettings: { create: {} },
          privacySecuritySettings: { create: {} },
          statistics: { create: {} },
        },
        include: { profile: true },
      });
    }

    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        username: user.profile?.username,
      },
      token,
    };
  }

  private generateToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }

  private async storeDeviceToken(
    userId: string,
    fcmToken: string,
    deviceName: string,
    platform?: string,
  ) {
    // Check if token already exists, reactivate if so, create if not
    await this.prisma.deviceToken.upsert({
      where: { fcmToken },
      update: {
        deviceName,
        platform,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        userAccountId: userId,
        fcmToken,
        deviceName,
        platform,
        isActive: true,
      },
    });
  }

  async logout(userId: string) {
    // Mark all device tokens as inactive instead of deleting
    await this.prisma.deviceToken.updateMany({
      where: {
        userAccountId: userId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    return { message: 'Logged out successfully' };
  }

  async removeAllDevices(userId: string) {
    // Mark all device tokens as inactive
    await this.prisma.deviceToken.updateMany({
      where: { userAccountId: userId },
      data: { isActive: false },
    });

    return { message: 'All devices logged out successfully' };
  }
}
