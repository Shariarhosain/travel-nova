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
  UploadedFiles,
  Patch,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor, FilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
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

  @Get()
  async getMyProfile(@Req() req: any) {
    return this.profileService.getProfile(req.user.id);
  }

  @Get(':username')
  async getProfileByUsername(
    @Param('username') username: string,
    @Req() req: any,
  ) {
    return this.profileService.getProfileByUsername(username, req.user?.id);
  }

  @Patch()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profileImage', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
    ]),
  )
  async updateProfile(
    @Req() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFiles() files: { profileImage?: Express.Multer.File[], coverImage?: Express.Multer.File[] },
  ) {
    let profileImageUrl: string | undefined;
    let coverImageUrl: string | undefined;

    if (files?.profileImage?.[0]) {
      profileImageUrl = await this.fileUploadService.uploadSingle(files.profileImage[0]);
    }
    
    if (files?.coverImage?.[0]) {
      coverImageUrl = await this.fileUploadService.uploadSingle(files.coverImage[0]);
    }

    return this.profileService.updateProfileWithImages(
      req.user.id,
      updateProfileDto,
      profileImageUrl,
      coverImageUrl,
    );
  }

  @Post('profile-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imageUrl = await this.fileUploadService.uploadSingle(file);
    return this.profileService.uploadProfileImage(req.user.id, imageUrl);
  }

  @Post('cover-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCoverImage(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imageUrl = await this.fileUploadService.uploadSingle(file);
    return this.profileService.uploadCoverImage(req.user.id, imageUrl);
  }

  @Put('social-links')
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

  @Patch('settings/account')
  async updateAccountSettings(
    @Req() req: any,
    @Body() settingsDto: UpdateAccountSettingsDto,
  ) {
    return this.profileService.updateAccountSettings(req.user.id, settingsDto);
  }

  @Patch('settings/privacy')
  async updatePrivacySettings(
    @Req() req: any,
    @Body() settingsDto: UpdateAccountSettingsDto,
  ) {
    return this.profileService.updateAccountSettings(req.user.id, settingsDto);
  }

  @Patch('settings/notifications')
  async updateNotificationSettings(
    @Req() req: any,
    @Body() settingsDto: UpdateNotificationSettingsDto,
  ) {
    return this.profileService.updateNotificationSettings(
      req.user.id,
      settingsDto,
    );
  }

  @Patch('settings/privacy-security')
  async updatePrivacySecuritySettings(
    @Req() req: any,
    @Body() settingsDto: UpdatePrivacySecuritySettingsDto,
  ) {
    return this.profileService.updatePrivacySecuritySettings(
      req.user.id,
      settingsDto,
    );
  }

  @Get('statistics')
  async getStatistics(@Req() req: any) {
    return this.profileService.getStatistics(req.user.id);
  }

  @Patch('deactivate')
  async deactivateAccount(@Req() req: any) {
    return this.profileService.deactivateAccount(req.user.id);
  }

  @Patch('reactivate')
  async reactivateAccount(@Req() req: any) {
    return this.profileService.reactivateAccount(req.user.id);
  }

  @Delete('delete')
  async deleteAccount(@Req() req: any) {
    return this.profileService.deleteAccount(req.user.id);
  }
}
