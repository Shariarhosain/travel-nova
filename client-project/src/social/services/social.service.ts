import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class SocialService {
  constructor(private prisma: PrismaService) {}

  async followUser(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const targetUser = await this.prisma.userAccount.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Check if already following
    const existingFollow = await this.prisma.following.findFirst({
      where: {
        userId,
        followingId: targetUserId,
      },
    });

    if (existingFollow) {
      throw new BadRequestException('Already following this user');
    }

    // Create both following and follower records
    await this.prisma.$transaction([
      this.prisma.following.create({
        data: {
          userId,
          followingId: targetUserId,
        },
      }),
      this.prisma.follower.create({
        data: {
          userId: targetUserId,
          followerId: userId,
        },
      }),
      // Update statistics
      this.prisma.userStatistics.update({
        where: { userAccountId: userId },
        data: { totalFollowing: { increment: 1 } },
      }),
      this.prisma.userStatistics.update({
        where: { userAccountId: targetUserId },
        data: { totalFollowers: { increment: 1 } },
      }),
      // Create notification
      this.prisma.notification.create({
        data: {
          userAccountId: targetUserId,
          type: 'follow',
          content: 'started following you',
          relatedUserId: userId,
        },
      }),
    ]);

    return { message: 'Successfully followed user' };
  }

  async unfollowUser(userId: string, targetUserId: string) {
    const following = await this.prisma.following.findFirst({
      where: {
        userId,
        followingId: targetUserId,
      },
    });

    if (!following) {
      throw new BadRequestException('Not following this user');
    }

    await this.prisma.$transaction([
      this.prisma.following.deleteMany({
        where: {
          userId,
          followingId: targetUserId,
        },
      }),
      this.prisma.follower.deleteMany({
        where: {
          userId: targetUserId,
          followerId: userId,
        },
      }),
      // Update statistics
      this.prisma.userStatistics.update({
        where: { userAccountId: userId },
        data: { totalFollowing: { decrement: 1 } },
      }),
      this.prisma.userStatistics.update({
        where: { userAccountId: targetUserId },
        data: { totalFollowers: { decrement: 1 } },
      }),
    ]);

    return { message: 'Successfully unfollowed user' };
  }

  async getFollowers(userId: string, skip = 0, take = 20) {
    const followers = await this.prisma.follower.findMany({
      where: { userId },
      skip,
      take,
      include: {
        follower: {
          select: {
            id: true,
            fullName: true,
            profile: {
              select: {
                username: true,
                profileImage: true,
                bio: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.follower.count({
      where: { userId },
    });

    return {
      data: followers.map((f) => ({
        id: f.follower.id,
        fullName: f.follower.fullName,
        username: f.follower.profile?.username,
        profileImage: f.follower.profile?.profileImage,
        bio: f.follower.profile?.bio,
        followedAt: f.createdAt,
      })),
      total,
      skip,
      take,
    };
  }

  async getFollowing(userId: string, skip = 0, take = 20) {
    const following = await this.prisma.following.findMany({
      where: { userId },
      skip,
      take,
      include: {
        following: {
          select: {
            id: true,
            fullName: true,
            profile: {
              select: {
                username: true,
                profileImage: true,
                bio: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.following.count({
      where: { userId },
    });

    return {
      data: following.map((f) => ({
        id: f.following.id,
        fullName: f.following.fullName,
        username: f.following.profile?.username,
        profileImage: f.following.profile?.profileImage,
        bio: f.following.profile?.bio,
        followedAt: f.createdAt,
      })),
      total,
      skip,
      take,
    };
  }

  async isFollowing(userId: string, targetUserId: string): Promise<boolean> {
    const following = await this.prisma.following.findFirst({
      where: {
        userId,
        followingId: targetUserId,
      },
    });

    return !!following;
  }

  async getSuggestedUsers(userId: string, take = 10) {
    // Get users that current user is not following
    const suggestions = await this.prisma.userAccount.findMany({
      where: {
        id: { not: userId },
        accountBanned: false,
        accountSettings: {
          suggestAccount: true,
        },
        followedBy: {
          none: {
            followerId: userId,
          },
        },
      },
      take,
      select: {
        id: true,
        fullName: true,
        profile: {
          select: {
            username: true,
            profileImage: true,
            bio: true,
          },
        },
        statistics: {
          select: {
            totalFollowers: true,
            totalPosts: true,
          },
        },
      },
      orderBy: {
        statistics: {
          totalFollowers: 'desc',
        },
      },
    });

    return suggestions;
  }
}
