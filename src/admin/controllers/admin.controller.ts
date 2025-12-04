import {
  Controller,
  Get,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from '../services/admin.service';
import { UpdateAdminSettingsDto } from '../dto/update-admin-settings.dto';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private adminService: AdminService) {}

  private checkAdmin(user: any) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
  }

  @Get('dashboard')
  async getDashboard(@Req() req: any) {
    this.checkAdmin(req.user);
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async getUsers(
    @Req() req: any,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
  ) {
    this.checkAdmin(req.user);
    return this.adminService.getUsers(
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 20,
      search,
    );
  }

  @Put('users/:userId/ban')
  async banUser(@Req() req: any, @Param('userId') userId: string) {
    this.checkAdmin(req.user);
    return this.adminService.banUser(userId);
  }

  @Put('users/:userId/unban')
  async unbanUser(@Req() req: any, @Param('userId') userId: string) {
    this.checkAdmin(req.user);
    return this.adminService.unbanUser(userId);
  }

  @Get('content/pending')
  async getPendingContent(
    @Req() req: any,
    @Query('type') type: 'posts' | 'itineraries',
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    this.checkAdmin(req.user);
    return this.adminService.getPendingContent(
      type,
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 20,
    );
  }

  @Put('posts/:postId/approve')
  async approvePost(@Req() req: any, @Param('postId') postId: string) {
    this.checkAdmin(req.user);
    return this.adminService.approvePost(postId);
  }

  @Delete('posts/:postId/reject')
  async rejectPost(@Req() req: any, @Param('postId') postId: string) {
    this.checkAdmin(req.user);
    return this.adminService.rejectPost(postId);
  }

  @Put('itineraries/:itineraryId/approve')
  async approveItinerary(
    @Req() req: any,
    @Param('itineraryId') itineraryId: string,
  ) {
    this.checkAdmin(req.user);
    return this.adminService.approveItinerary(itineraryId);
  }

  @Delete('itineraries/:itineraryId')
  async deleteItinerary(
    @Req() req: any,
    @Param('itineraryId') itineraryId: string,
  ) {
    this.checkAdmin(req.user);
    return this.adminService.deleteItinerary(itineraryId);
  }

  @Get('settings')
  async getAdminSettings(@Req() req: any) {
    this.checkAdmin(req.user);
    return this.adminService.getAdminSettings(req.user.userId);
  }

  @Patch('settings')
  async updateAdminSettings(
    @Req() req: any,
    @Body() settingsDto: UpdateAdminSettingsDto,
  ) {
    this.checkAdmin(req.user);
    return this.adminService.updateAdminSettings(req.user.userId, settingsDto);
  }
}
