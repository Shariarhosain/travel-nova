import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalPosts,
      totalItineraries,
      pendingPosts,
      pendingItineraries,
    ] = await Promise.all([
      this.prisma.userAccount.count(),
      this.prisma.userAccount.count({ where: { accountBanned: false } }),
      this.prisma.post.count({ where: { status: 'ACTIVE' } }),
      this.prisma.itinerary.count(),
      this.prisma.post.count({
        where: { approvedByAdmin: false, status: 'ACTIVE' },
      }),
      this.prisma.itinerary.count({ where: { approvedByAdmin: false } }),
    ]);

    const engagement = await this.prisma.post.aggregate({
      _sum: {
        likeCount: true,
        commentCount: true,
        shareCount: true,
        viewCount: true,
      },
    });

    return {
      totalUsers,
      activeUsers,
      totalPosts,
      totalItineraries,
      pendingPosts,
      pendingItineraries,
      totalLikes: engagement._sum.likeCount || 0,
      totalComments: engagement._sum.commentCount || 0,
      totalShares: engagement._sum.shareCount || 0,
      totalViews: engagement._sum.viewCount || 0,
    };
  }

  async getUsers(skip = 0, take = 20, search?: string) {
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { profile: { username: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const users = await this.prisma.userAccount.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        accountBanned: true,
        createdAt: true,
        profile: {
          select: {
            username: true,
            profileImage: true,
          },
        },
        statistics: {
          select: {
            totalPosts: true,
            totalFollowers: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.userAccount.count({ where });

    return { data: users, total, skip, take };
  }

  async banUser(userId: string) {
    await this.prisma.userAccount.update({
      where: { id: userId },
      data: { accountBanned: true },
    });

    return { message: 'User banned successfully' };
  }

  async unbanUser(userId: string) {
    await this.prisma.userAccount.update({
      where: { id: userId },
      data: { accountBanned: false },
    });

    return { message: 'User unbanned successfully' };
  }

  async getPendingContent(type: 'posts' | 'itineraries', skip = 0, take = 20) {
    if (type === 'posts') {
      const posts = await this.prisma.post.findMany({
        where: { approvedByAdmin: false, status: 'ACTIVE' },
        skip,
        take,
        include: {
          userAccount: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  username: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const total = await this.prisma.post.count({
        where: { approvedByAdmin: false, status: 'ACTIVE' },
      });

      return { data: posts, total, skip, take };
    } else {
      const itineraries = await this.prisma.itinerary.findMany({
        where: { approvedByAdmin: false },
        skip,
        take,
        include: {
          userAccount: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  username: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const total = await this.prisma.itinerary.count({
        where: { approvedByAdmin: false },
      });

      return { data: itineraries, total, skip, take };
    }
  }

  async approvePost(postId: string) {
    await this.prisma.post.update({
      where: { id: postId },
      data: { approvedByAdmin: true },
    });

    return { message: 'Post approved successfully' };
  }

  async rejectPost(postId: string) {
    await this.prisma.post.update({
      where: { id: postId },
      data: { status: 'DELETED' },
    });

    return { message: 'Post rejected successfully' };
  }

  async approveItinerary(itineraryId: string) {
    await this.prisma.itinerary.update({
      where: { id: itineraryId },
      data: { approvedByAdmin: true },
    });

    return { message: 'Itinerary approved successfully' };
  }

  async deleteItinerary(itineraryId: string) {
    await this.prisma.itinerary.delete({
      where: { id: itineraryId },
    });

    return { message: 'Itinerary deleted successfully' };
  }
}
