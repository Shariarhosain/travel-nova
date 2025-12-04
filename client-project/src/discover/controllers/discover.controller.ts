import { Controller, Get, Query } from '@nestjs/common';
import { DiscoverService } from '../services/discover.service';

@Controller('discover')
export class DiscoverController {
  constructor(private discoverService: DiscoverService) {}

  @Get('trending-destinations')
  async getTrendingDestinations(@Query('take') take?: string) {
    return this.discoverService.getTrendingDestinations(
      take ? parseInt(take) : 10,
    );
  }

  @Get('top-posts')
  async getTopPosts(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.discoverService.getTopPosts(
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 20,
    );
  }

  @Get('top-itineraries')
  async getTopItineraries(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.discoverService.getTopItineraries(
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 20,
    );
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('type') type?: 'posts' | 'itineraries' | 'users',
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.discoverService.search(
      query,
      type,
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 20,
    );
  }

  @Get('tags/:tagName')
  async getPostsByTag(
    @Query('tagName') tagName: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.discoverService.getPostsByTag(
      tagName,
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 20,
    );
  }
}
