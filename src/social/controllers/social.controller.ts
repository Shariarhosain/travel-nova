import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SocialService } from '../services/social.service';

@Controller('social')
@UseGuards(AuthGuard('jwt'))
export class SocialController {
  constructor(private socialService: SocialService) {}

  @Post('follow/:userId')
  async followUser(@Req() req: any, @Param('userId') userId: string) {
    return this.socialService.followUser(req.user.id, userId);
  }

  @Delete('unfollow/:userId')
  async unfollowUser(@Req() req: any, @Param('userId') userId: string) {
    return this.socialService.unfollowUser(req.user.id, userId);
  }

  @Get('followers/:userId')
  async getFollowers(
    @Param('userId') userId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.socialService.getFollowers(
      userId,
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 20,
    );
  }

  @Get('following/:userId')
  async getFollowing(
    @Param('userId') userId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.socialService.getFollowing(
      userId,
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 20,
    );
  }

  @Get('is-following/:userId')
  async isFollowing(@Req() req: any, @Param('userId') userId: string) {
    const isFollowing = await this.socialService.isFollowing(
      req.user.id,
      userId,
    );
    return { isFollowing };
  }

  @Get('suggestions')
  async getSuggestedUsers(@Req() req: any, @Query('take') take?: string) {
    return this.socialService.getSuggestedUsers(
      req.user.id,
      take ? parseInt(take) : 10,
    );
  }
}
