import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateItineraryDto } from '../dto/create-itinerary.dto';
import { UpdateItineraryDto } from '../dto/update-itinerary.dto';
import * as countryMapping from '../../common/country-continent-mapping.json';

@Injectable()
export class ItinerariesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateItineraryDto) {
    const { tags, bestTimeToVisit, attractions, hotels, ...itineraryData } = createDto;

    const itinerary = await this.prisma.itinerary.create({
      data: {
        ...itineraryData,
        userAccountId: userId,
      },
    });

    // Add tags
    if (tags && tags.length > 0) {
      await this.addTags(itinerary.id, tags);
    }

    // Add best time to visit
    if (bestTimeToVisit && bestTimeToVisit.length > 0) {
      await this.prisma.bestTimeToVisit.createMany({
        data: bestTimeToVisit.map((item) => ({
          ...item,
          itineraryId: itinerary.id,
        })),
      });
    }

    // Add attractions
    if (attractions && attractions.length > 0) {
      await this.prisma.mostVisitAttraction.createMany({
        data: attractions.map((item) => ({
          ...item,
          itineraryId: itinerary.id,
        })),
      });
    }

    // Add hotels
    if (hotels && hotels.length > 0) {
      await this.prisma.whereToStay.createMany({
        data: hotels.map((item) => ({
          ...item,
          itineraryId: itinerary.id,
        })),
      });
    }

    // Update travel statistics after creating itinerary
    await this.updateUserTravelStatistics(userId);

    return this.findOne(itinerary.id, userId);
  }

  async findAll(userId?: string, skip = 0, take = 20) {
    const itineraries = await this.prisma.itinerary.findMany({
      where: { visibility: 'ALL' },
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
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.itinerary.count({
      where: { visibility: 'ALL' },
    });

    return { data: itineraries, total, skip, take };
  }

  async findOne(id: string, userId?: string) {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id },
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
        tags: {
          include: {
            tag: true,
          },
        },
        bestTimeToVisit: true,
        mostVisitAttractions: true,
        whereToStay: true,
      },
    });

    if (!itinerary) {
      throw new NotFoundException('Itinerary not found');
    }

    let isLiked = false;
    let isSaved = false;

    if (userId) {
      const [like, save] = await Promise.all([
        this.prisma.itineraryLike.findFirst({
          where: { itineraryId: id, userAccountId: userId },
        }),
        this.prisma.itinerarySave.findFirst({
          where: { itineraryId: id, userAccountId: userId },
        }),
      ]);

      isLiked = !!like;
      isSaved = !!save;
    }

    return { ...itinerary, isLiked, isSaved };
  }

  async update(id: string, userId: string, updateDto: UpdateItineraryDto) {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id },
    });

    if (!itinerary) {
      throw new NotFoundException('Itinerary not found');
    }

    if (itinerary.userAccountId !== userId) {
      throw new ForbiddenException('You can only update your own itineraries');
    }

    await this.prisma.itinerary.update({
      where: { id },
      data: updateDto,
    });

    // Update travel statistics after updating itinerary
    await this.updateUserTravelStatistics(userId);

    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string) {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id },
    });

    if (!itinerary) {
      throw new NotFoundException('Itinerary not found');
    }

    if (itinerary.userAccountId !== userId) {
      throw new ForbiddenException('You can only delete your own itineraries');
    }

    await this.prisma.itinerary.delete({ where: { id } });

    return { message: 'Itinerary deleted successfully' };
  }

  async likeItinerary(itineraryId: string, userId: string) {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id: itineraryId },
    });

    if (!itinerary) {
      throw new NotFoundException('Itinerary not found');
    }

    const existingLike = await this.prisma.itineraryLike.findFirst({
      where: { itineraryId, userAccountId: userId },
    });

    if (existingLike) {
      return { message: 'Already liked' };
    }

    await this.prisma.$transaction([
      this.prisma.itineraryLike.create({
        data: { itineraryId, userAccountId: userId },
      }),
      this.prisma.itinerary.update({
        where: { id: itineraryId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);

    return { message: 'Itinerary liked successfully' };
  }

  async unlikeItinerary(itineraryId: string, userId: string) {
    await this.prisma.$transaction([
      this.prisma.itineraryLike.deleteMany({
        where: { itineraryId, userAccountId: userId },
      }),
      this.prisma.itinerary.update({
        where: { id: itineraryId },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);

    return { message: 'Itinerary unliked successfully' };
  }

  async saveItinerary(itineraryId: string, userId: string) {
    const existingSave = await this.prisma.itinerarySave.findFirst({
      where: { itineraryId, userAccountId: userId },
    });

    if (existingSave) {
      return { message: 'Already saved' };
    }

    await this.prisma.itinerarySave.create({
      data: { itineraryId, userAccountId: userId },
    });

    return { message: 'Itinerary saved successfully' };
  }

  async unsaveItinerary(itineraryId: string, userId: string) {
    await this.prisma.itinerarySave.deleteMany({
      where: { itineraryId, userAccountId: userId },
    });

    return { message: 'Itinerary unsaved successfully' };
  }

  async getSavedItineraries(userId: string, skip = 0, take = 20) {
    const saved = await this.prisma.itinerarySave.findMany({
      where: { userAccountId: userId },
      skip,
      take,
      include: {
        itinerary: {
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
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.itinerarySave.count({
      where: { userAccountId: userId },
    });

    return { data: saved.map((s) => s.itinerary), total, skip, take };
  }

  private async updateUserTravelStatistics(userId: string) {
    // Get all user itineraries with destinations
    const itineraries = await this.prisma.itinerary.findMany({
      where: { 
        userAccountId: userId,
      },
      select: {
        destination: true,
      },
    });

    // Get user profile countries
    const profile = await this.prisma.userProfile.findUnique({
      where: { userAccountId: userId },
      select: { countriesExplored: true },
    });

    // Extract countries from itinerary destinations
    const itineraryCountries = new Set<string>();
    for (const itinerary of itineraries) {
      if (itinerary.destination) {
        const country = this.extractCountry(itinerary.destination);
        if (country) {
          itineraryCountries.add(country);
        }
      }
    }

    // Combine profile countries with itinerary countries
    const profileCountries = (profile?.countriesExplored as string[]) || [];
    const allCountries = new Set([
      ...itineraryCountries,
      ...profileCountries,
    ]);

    // Calculate continents from countries
    const continents = new Set<string>();
    for (const country of allCountries) {
      const continent = countryMapping[country as keyof typeof countryMapping];
      if (continent) {
        continents.add(continent);
      }
    }

    // Upsert statistics
    await this.prisma.userStatistics.upsert({
      where: { userAccountId: userId },
      update: {
        totalTrips: itineraries.length,
        countriesVisited: allCountries.size,
        continentsVisited: continents.size,
      },
      create: {
        userAccountId: userId,
        totalTrips: itineraries.length,
        countriesVisited: allCountries.size,
        continentsVisited: continents.size,
      },
    });
  }

  private extractCountry(destination: string): string | null {
    // Destinations are in format "City, Country" or just "Country"
    const parts = destination.split(',').map((p) => p.trim());
    return parts.length > 1 ? parts[parts.length - 1] : parts[0];
  }

  private async addTags(itineraryId: string, tagNames: string[]) {
    for (const tagName of tagNames) {
      const tag = await this.prisma.tag.upsert({
        where: { tagName: tagName.toLowerCase() },
        update: {},
        create: { tagName: tagName.toLowerCase() },
      });

      await this.prisma.itineraryTag.upsert({
        where: {
          itineraryId_tagId: {
            itineraryId,
            tagId: tag.id,
          },
        },
        update: {},
        create: {
          itineraryId,
          tagId: tag.id,
        },
      });
    }
  }
}
