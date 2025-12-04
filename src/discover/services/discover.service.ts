import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class DiscoverService {
  constructor(private prisma: PrismaService) {}

  async getTrendingDestinations(take = 10) {
    const destinations = await this.prisma.trendingDestination.findMany({
      take,
      orderBy: { popularityScore: 'desc' },
    });

    return destinations;
  }

  async getTopPosts(skip = 0, take = 20) {
    const posts = await this.prisma.post.findMany({
      where: {
        status: 'ACTIVE',
        visibility: 'ALL',
        approvedByAdmin: true,
      },
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
                profileImage: true,
              },
            },
          },
        },
        postTags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: [
        { likeCount: 'desc' },
        { viewCount: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return { data: posts, skip, take };
  }

  async getTopItineraries(skip = 0, take = 20) {
    const itineraries = await this.prisma.itinerary.findMany({
      where: {
        visibility: 'ALL',
        approvedByAdmin: true,
      },
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
                profileImage: true,
              },
            },
          },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { likeCount: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return { data: itineraries, skip, take };
  }

  async search(query: string, type?: 'posts' | 'itineraries' | 'users', skip = 0, take = 20) {
    if (!type || type === 'posts') {
      const posts = await this.prisma.post.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { caption: { contains: query, mode: 'insensitive' } },
            { details: { contains: query, mode: 'insensitive' } },
            { location: { contains: query, mode: 'insensitive' } },
          ],
        },
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
                  profileImage: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (type === 'posts') {
        return { data: posts, type: 'posts', skip, take };
      }
    }

    if (!type || type === 'itineraries') {
      const itineraries = await this.prisma.itinerary.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { destination: { contains: query, mode: 'insensitive' } },
            { country: { contains: query, mode: 'insensitive' } },
          ],
        },
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
                  profileImage: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (type === 'itineraries') {
        return { data: itineraries, type: 'itineraries', skip, take };
      }
    }

    if (!type || type === 'users') {
      const users = await this.prisma.userAccount.findMany({
        where: {
          accountBanned: false,
          OR: [
            { fullName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { profile: { username: { contains: query, mode: 'insensitive' } } },
          ],
        },
        skip,
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
              totalPosts: true,
              totalFollowers: true,
            },
          },
        },
        orderBy: {
          statistics: {
            totalFollowers: 'desc',
          },
        },
      });

      if (type === 'users') {
        return { data: users, type: 'users', skip, take };
      }
    }

    return { message: 'Search complete' };
  }

  async getPostsByTag(tagName: string, skip = 0, take = 20) {
    const posts = await this.prisma.post.findMany({
      where: {
        status: 'ACTIVE',
        postTags: {
          some: {
            tag: {
              tagName: tagName.toLowerCase(),
            },
          },
        },
      },
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
                profileImage: true,
              },
            },
          },
        },
        postTags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.post.count({
      where: {
        status: 'ACTIVE',
        postTags: {
          some: {
            tag: {
              tagName: tagName.toLowerCase(),
            },
          },
        },
      },
    });

    return { data: posts, total, skip, take };
  }
}
