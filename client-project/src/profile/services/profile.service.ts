import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdateAccountSettingsDto } from '../dto/update-account-settings.dto';
import {
  UpdateNotificationSettingsDto,
  UpdatePrivacySecuritySettingsDto,
} from '../dto/update-settings.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.userAccount.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            socialLinks: true,
          },
        },
        accountSettings: true,
        notificationSettings: true,
        privacySecuritySettings: {
          select: {
            id: true,
            twoFactorEnabled: true,
            enableFaceId: true,
            rememberMe: true,
            rememberMeBrowser: true,
            trustedContactEmail: true,
          },
        },
        statistics: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getProfileByUsername(username: string, requestingUserId?: string) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { username },
      include: {
        userAccount: {
          select: {
            id: true,
            fullName: true,
            createdAt: true,
            accountSettings: true,
            statistics: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Check privacy settings
    const isPrivate = profile.userAccount.accountSettings?.accountPrivate;
    
    if (isPrivate && requestingUserId !== profile.userAccount.id) {
      // Check if requesting user follows this user
      const isFollowing = await this.prisma.following.findFirst({
        where: {
          userId: requestingUserId || '',
          followingId: profile.userAccount.id,
        },
      });

      if (!isFollowing) {
        throw new NotFoundException('This account is private');
      }
    }

    return profile;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    // Check if username is already taken
    if (updateProfileDto.username) {
      const existing = await this.prisma.userProfile.findUnique({
        where: { username: updateProfileDto.username },
      });

      if (existing && existing.userAccountId !== userId) {
        throw new ConflictException('Username already taken');
      }
    }

    const profile = await this.prisma.userProfile.update({
      where: { userAccountId: userId },
      data: {
        ...updateProfileDto,
        birthday: updateProfileDto.birthday
          ? new Date(updateProfileDto.birthday)
          : undefined,
      },
      include: {
        socialLinks: true,
      },
    });

    return profile;
  }

  async uploadProfileImage(userId: string, imageUrl: string) {
    return this.prisma.userProfile.update({
      where: { userAccountId: userId },
      data: { profileImage: imageUrl },
    });
  }

  async uploadCoverImage(userId: string, imageUrl: string) {
    return this.prisma.userProfile.update({
      where: { userAccountId: userId },
      data: { coverImage: imageUrl },
    });
  }

  async updateSocialLinks(
    userId: string,
    socialLinks: {
      instagramUsername?: string;
      twitterUsername?: string;
      facebookUsername?: string;
    },
  ) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userAccountId: userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.userSocialLinks.upsert({
      where: { userProfileId: profile.id },
      update: socialLinks,
      create: {
        userProfileId: profile.id,
        ...socialLinks,
      },
    });
  }

  async updateAccountSettings(
    userId: string,
    settingsDto: UpdateAccountSettingsDto,
  ) {
    return this.prisma.userAccountSettings.upsert({
      where: { userAccountId: userId },
      update: settingsDto,
      create: {
        userAccountId: userId,
        ...settingsDto,
      },
    });
  }

  async updateNotificationSettings(
    userId: string,
    settingsDto: UpdateNotificationSettingsDto,
  ) {
    return this.prisma.notificationSettings.upsert({
      where: { userAccountId: userId },
      update: settingsDto,
      create: {
        userAccountId: userId,
        ...settingsDto,
      },
    });
  }

  async updatePrivacySecuritySettings(
    userId: string,
    settingsDto: UpdatePrivacySecuritySettingsDto,
  ) {
    return this.prisma.privacySecuritySettings.upsert({
      where: { userAccountId: userId },
      update: settingsDto,
      create: {
        userAccountId: userId,
        ...settingsDto,
      },
    });
  }

  async getStatistics(userId: string) {
    return this.prisma.userStatistics.findUnique({
      where: { userAccountId: userId },
    });
  }
}
