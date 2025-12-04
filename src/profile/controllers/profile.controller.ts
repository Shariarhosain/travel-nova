import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Req,
  Param,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from '../services/profile.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdateAccountSettingsDto } from '../dto/update-account-settings.dto';
import {
  UpdateNotificationSettingsDto,
  UpdatePrivacySecuritySettingsDto,
} from '../dto/update-settings.dto';
import { FileUploadService } from '../../file-upload/services/file-upload.service';

@Controller('profile')
@UseGuards(AuthGuard('jwt'))
export class ProfileController {
  constructor(
    private profileService: ProfileService,
    private fileUploadService: FileUploadService,
  ) {}

  @Get('me')
  async getMyProfile(@Req() req: any) {
    return this.profileService.getProfile(req.user.id);
  }

  @Get('username/:username')
  async getProfileByUsername(
    @Param('username') username: string,
    @Req() req: any,
  ) {
    return this.profileService.getProfileByUsername(username, req.user?.id);
  }

  @Put('me')
  async updateProfile(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user.id, updateProfileDto);
  }

  @Post('me/profile-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imageUrl = await this.fileUploadService.uploadSingle(file);
    return this.profileService.uploadProfileImage(req.user.id, imageUrl);
  }

  @Post('me/cover-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCoverImage(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imageUrl = await this.fileUploadService.uploadSingle(file);
    return this.profileService.uploadCoverImage(req.user.id, imageUrl);
  }

  @Put('me/social-links')
  async updateSocialLinks(
    @Req() req: any,
    @Body()
    socialLinks: {
      instagramUsername?: string;
      twitterUsername?: string;
      facebookUsername?: string;
    },
  ) {
    return this.profileService.updateSocialLinks(req.user.id, socialLinks);
  }

  @Put('me/settings/account')
  async updateAccountSettings(
    @Req() req: any,
    @Body() settingsDto: UpdateAccountSettingsDto,
  ) {
    return this.profileService.updateAccountSettings(req.user.id, settingsDto);
  }

  @Put('me/settings/notifications')
  async updateNotificationSettings(
    @Req() req: any,
    @Body() settingsDto: UpdateNotificationSettingsDto,
  ) {
    return this.profileService.updateNotificationSettings(
      req.user.id,
      settingsDto,
    );
  }

  @Put('me/settings/privacy-security')
  async updatePrivacySecuritySettings(
    @Req() req: any,
    @Body() settingsDto: UpdatePrivacySecuritySettingsDto,
  ) {
    return this.profileService.updatePrivacySecuritySettings(
      req.user.id,
      settingsDto,
    );
  }

  @Get('me/statistics')
  async getStatistics(@Req() req: any) {
    return this.profileService.getStatistics(req.user.id);
  }
}
