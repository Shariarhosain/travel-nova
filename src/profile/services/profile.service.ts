import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdateAccountSettingsDto } from '../dto/update-account-settings.dto';
import {
  UpdateNotificationSettingsDto,
  UpdatePrivacySecuritySettingsDto,
} from '../dto/update-settings.dto';
import * as countryMapping from '../../common/country-continent-mapping.json';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProfileService {
  private readonly baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  constructor(private prisma: PrismaService) {}

  private formatImageUrl(url: string | null): string | null {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${this.baseUrl}${url}`;
  }

  private formatProfile(profile: any) {
    return {
      ...profile,
      profileImage: this.formatImageUrl(profile.profileImage),
      coverImage: this.formatImageUrl(profile.coverImage),
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.userAccount.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        accountBanned: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          include: {
            socialLinks: true,
          },
        },
        accountSettings: true,
        notificationSettings: true,
        adminSettings: true,
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
        deviceTokens: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            deviceName: true,
            platform: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    if (user?.profile) {
      user.profile = this.formatProfile(user.profile) as any;
    }

    // Modify notification settings based on role
    if (user.notificationSettings) {
      const baseSettings = {
        id: user.notificationSettings.id,
        userAccountId: user.notificationSettings.userAccountId,
        createdAt: user.notificationSettings.createdAt,
        updatedAt: user.notificationSettings.updatedAt,
      };

      if (user.role === 'ADMIN') {
        user.notificationSettings = {
          ...baseSettings,
          adminAdminNotification: user.notificationSettings.adminAdminNotification,
          adminSecurityAlerts: user.notificationSettings.adminSecurityAlerts,
        } as any;
      } else {
        user.notificationSettings = {
          ...baseSettings,
          pushNotification: user.notificationSettings.pushNotification,
          emailNotification: user.notificationSettings.emailNotification,
        } as any;
      }
    }

    // Format active sessions - get only the most recent active device
    const activeSession = user.deviceTokens?.[0] ? {
      id: user.deviceTokens[0].id,
      deviceName: user.deviceTokens[0].deviceName,
      platform: user.deviceTokens[0].platform,
      status: 'Active',
      lastActive: user.deviceTokens[0].updatedAt,
      loginDate: user.deviceTokens[0].createdAt,
    } : null;

    // Remove deviceTokens from response and add activeSession
    const { 
      deviceTokens, 
      adminSettings, 
      accountSettings,
      notificationSettings,
      privacySecuritySettings,
      statistics,
      ...userWithoutDeviceTokens 
    } = user;
    
    // Build response based on role
    const response: any = {
      ...userWithoutDeviceTokens,
      activeSession,
    };

    if (user.role === 'ADMIN') {
      // For ADMIN users, only show admin-specific settings and notification settings
      response.notificationSettings = user.notificationSettings;
      
      // Fetch or create admin settings if they don't exist
      if (!adminSettings) {
        const createdAdminSettings = await this.prisma.adminSettings.upsert({
          where: { userAccountId: userId },
          update: {},
          create: {
            userAccountId: userId,
            adminAutoApprovePosts: false,
            adminNewRegistrations: true,
          },
        });
        response.adminSettings = createdAdminSettings;
      } else {
        response.adminSettings = adminSettings;
      }
    } else {
      // For regular users, show all their settings except admin settings
      response.accountSettings = accountSettings;
      response.notificationSettings = user.notificationSettings;
      response.privacySecuritySettings = privacySecuritySettings;
      response.statistics = statistics;
    }
    
    return response;
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
        socialLinks: true,
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

    return this.formatProfile(profile);
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

    // Remove duplicates from arrays
    const cleanedData = {
      ...updateProfileDto,
      countriesExplored: updateProfileDto.countriesExplored
        ? [...new Set(updateProfileDto.countriesExplored)]
        : undefined,
      achievements: updateProfileDto.achievements
        ? [...new Set(updateProfileDto.achievements)]
        : undefined,
    };

    const profile = await this.prisma.userProfile.update({
      where: { userAccountId: userId },
      data: {
        ...cleanedData,
        birthday: cleanedData.birthday
          ? new Date(cleanedData.birthday)
          : undefined,
      },
      include: {
        socialLinks: true,
      },
    });

    return this.formatProfile(profile);
  }

  async updateProfileWithImages(
    userId: string,
    updateProfileDto: UpdateProfileDto,
    profileImage?: string,
    coverImage?: string,
  ) {
    const {
      email,
      fullName,
      currentPassword,
      password,
      instagramUsername,
      twitterUsername,
      facebookUsername,
      ...profileData
    } = updateProfileDto;

    // Check if username is already taken
    if (profileData.username) {
      const existing = await this.prisma.userProfile.findUnique({
        where: { username: profileData.username },
      });

      if (existing && existing.userAccountId !== userId) {
        throw new ConflictException('Username already taken');
      }
    }

    // Check if email is already taken
    if (email) {
      const existingEmail = await this.prisma.userAccount.findUnique({
        where: { email },
      });

      if (existingEmail && existingEmail.id !== userId) {
        throw new ConflictException('Email already taken');
      }
    }

    // Verify current password if trying to update password
    if (password) {
      if (!currentPassword) {
        throw new ConflictException('Current password is required to change password');
      }

      const user = await this.prisma.userAccount.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new ConflictException('Current password is incorrect');
      }
    }

    // Update user account (email, fullName, password)
    if (email || fullName || password) {
      const updateData: any = {
        ...(email && { email }),
        ...(fullName && { fullName }),
      };

      // Hash password if provided
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      await this.prisma.userAccount.update({
        where: { id: userId },
        data: updateData,
      });
    }

    // Remove duplicates from arrays
    const cleanedProfileData = {
      ...profileData,
      countriesExplored: profileData.countriesExplored
        ? [...new Set(profileData.countriesExplored)]
        : undefined,
      achievements: profileData.achievements
        ? [...new Set(profileData.achievements)]
        : undefined,
    };

    // Update profile
    const profile = await this.prisma.userProfile.update({
      where: { userAccountId: userId },
      data: {
        ...cleanedProfileData,
        birthday: cleanedProfileData.birthday
          ? new Date(cleanedProfileData.birthday)
          : undefined,
        ...(profileImage && { profileImage }),
        ...(coverImage && { coverImage }),
      },
      include: {
        socialLinks: true,
      },
    });

    // Update social links
    if (instagramUsername || twitterUsername || facebookUsername) {
      await this.prisma.userSocialLinks.upsert({
        where: { userProfileId: profile.id },
        update: {
          ...(instagramUsername !== undefined && { instagramUsername }),
          ...(twitterUsername !== undefined && { twitterUsername }),
          ...(facebookUsername !== undefined && { facebookUsername }),
        },
        create: {
          userProfileId: profile.id,
          instagramUsername,
          twitterUsername,
          facebookUsername,
        },
      });

      // Fetch updated profile with social links
      const updatedProfile = await this.prisma.userProfile.findUnique({
        where: { id: profile.id },
        include: {
          socialLinks: true,
        },
      });

      // Update travel statistics
      await this.updateTravelStatistics(userId);

      return {
        message: 'Profile updated successfully',
        profile: this.formatProfile(updatedProfile),
      };
    }

    // Update travel statistics
    await this.updateTravelStatistics(userId);

    return {
      message: 'Profile updated successfully',
      profile: this.formatProfile(profile),
    };
  }

  async updateTravelStatistics(userId: string) {
    const travelStats = await this.calculateTravelStatistics(userId);
    
    await this.prisma.userStatistics.upsert({
      where: { userAccountId: userId },
      update: travelStats,
      create: {
        userAccountId: userId,
        ...travelStats,
      },
    });
  }

  async uploadProfileImage(userId: string, imageUrl: string) {
    const profile = await this.prisma.userProfile.update({
      where: { userAccountId: userId },
      data: { profileImage: imageUrl },
    });
    return this.formatProfile(profile);
  }

  async uploadCoverImage(userId: string, imageUrl: string) {
    const profile = await this.prisma.userProfile.update({
      where: { userAccountId: userId },
      data: { coverImage: imageUrl },
    });
    return this.formatProfile(profile);
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
    // Get user role to check if admin
    const user = await this.prisma.userAccount.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Separate admin fields from regular settings
    const { adminAutoApprovePosts, adminNewRegistrations, ...accountSettings } = settingsDto;

    // Update regular account settings
    await this.prisma.userAccountSettings.upsert({
      where: { userAccountId: userId },
      update: accountSettings,
      create: {
        userAccountId: userId,
        ...accountSettings,
      },
    });

    // If user is ADMIN and admin fields are provided, update admin settings
    if (user.role === 'ADMIN' && (adminAutoApprovePosts !== undefined || adminNewRegistrations !== undefined)) {
      await this.prisma.adminSettings.upsert({
        where: { userAccountId: userId },
        update: {
          ...(adminAutoApprovePosts !== undefined && { adminAutoApprovePosts }),
          ...(adminNewRegistrations !== undefined && { adminNewRegistrations }),
        },
        create: {
          userAccountId: userId,
          adminAutoApprovePosts: adminAutoApprovePosts ?? false,
          adminNewRegistrations: adminNewRegistrations ?? true,
        },
      });
    }

    return { success: true, message: 'Settings updated successfully' };
  }

  async updateNotificationSettings(
    userId: string,
    settingsDto: UpdateNotificationSettingsDto,
  ) {
    // Get user role
    const user = await this.prisma.userAccount.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Filter settings based on role
    const updateData: any = {};
    
    // All users can update these
    if (settingsDto.pushNotification !== undefined) {
      updateData.pushNotification = settingsDto.pushNotification;
    }
    if (settingsDto.emailNotification !== undefined) {
      updateData.emailNotification = settingsDto.emailNotification;
    }
    
    // Only admins can update these
    if (user.role === 'ADMIN') {
      if (settingsDto.adminAdminNotification !== undefined) {
        updateData.adminAdminNotification = settingsDto.adminAdminNotification;
      }
      if (settingsDto.adminSecurityAlerts !== undefined) {
        updateData.adminSecurityAlerts = settingsDto.adminSecurityAlerts;
      }
    }

    await this.prisma.notificationSettings.upsert({
      where: { userAccountId: userId },
      update: updateData,
      create: {
        userAccountId: userId,
        pushNotification: settingsDto.pushNotification ?? true,
        emailNotification: settingsDto.emailNotification ?? true,
        adminAdminNotification: user.role === 'ADMIN' ? (settingsDto.adminAdminNotification ?? true) : true,
        adminSecurityAlerts: user.role === 'ADMIN' ? (settingsDto.adminSecurityAlerts ?? true) : true,
      },
    });

    return { success: true, message: 'Notification settings updated successfully' };
  }

  async updatePrivacySecuritySettings(
    userId: string,
    settingsDto: UpdatePrivacySecuritySettingsDto,
  ) {
    await this.prisma.privacySecuritySettings.upsert({
      where: { userAccountId: userId },
      update: settingsDto,
      create: {
        userAccountId: userId,
        ...settingsDto,
      },
    });

    return { success: true, message: 'Privacy and security settings updated successfully' };
  }

  async getStatistics(userId: string) {
    return this.prisma.userStatistics.findUnique({
      where: { userAccountId: userId },
    });
  }

  private async calculateTravelStatistics(userId: string) {
    // Get total itineraries (trips)
    const totalTrips = await this.prisma.itinerary.count({
      where: { userAccountId: userId },
    });

    // Get user's countries from profile
    const profile = await this.prisma.userProfile.findUnique({
      where: { userAccountId: userId },
      select: { countriesExplored: true },
    });

    // Get countries from itineraries
    const itineraries = await this.prisma.itinerary.findMany({
      where: { userAccountId: userId },
      select: { destination: true },
    });

    // Combine countries from profile and itineraries
    const profileCountries = (profile?.countriesExplored as string[]) || [];
    const itineraryCountries = itineraries
      .map(it => this.extractCountry(it.destination))
      .filter((country): country is string => country !== null);
    
    // Merge and get unique countries
    const allCountries = new Set([...profileCountries, ...itineraryCountries]);
    const countriesVisited = allCountries.size;

    // Calculate continents using the mapping file
    const continents = new Set<string>();
    allCountries.forEach(country => {
      const continent = countryMapping[country as keyof typeof countryMapping];
      if (continent) {
        continents.add(continent);
      }
    });
    const continentsVisited = continents.size;

    return {
      totalTrips,
      countriesVisited,
      continentsVisited,
    };
  }

  private extractCountry(destination: string | null): string | null {
    if (!destination) return null;
    // Extract country from destination like "Paris, France" -> "France"
    const parts = destination.split(',').map(p => p.trim());
    return parts.length > 1 ? parts[parts.length - 1] : parts[0];
  }

  async deactivateAccount(userId: string) {
    await this.prisma.userAccount.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return { success: true, message: 'Account deactivated successfully' };
  }

  async reactivateAccount(userId: string) {
    await this.prisma.userAccount.update({
      where: { id: userId },
      data: { isActive: true },
    });

    return { success: true, message: 'Account reactivated successfully' };
  }

  async deleteAccount(userId: string) {
    await this.prisma.userAccount.delete({
      where: { id: userId },
    });

    return { success: true, message: 'Account deleted successfully' };
  }
}
