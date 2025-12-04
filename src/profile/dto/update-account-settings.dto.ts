import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateAccountSettingsDto {
  @IsOptional()
  @IsBoolean()
  accountPrivate?: boolean;

  @IsOptional()
  @IsBoolean()
  showActivityStatus?: boolean;

  @IsOptional()
  @IsBoolean()
  showFollowersList?: boolean;

  @IsOptional()
  @IsBoolean()
  showFollowingList?: boolean;

  @IsOptional()
  @IsBoolean()
  showLikedPosts?: boolean;

  @IsOptional()
  @IsBoolean()
  showSavedPosts?: boolean;

  @IsOptional()
  @IsBoolean()
  discoverableByEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  discoverableByUsername?: boolean;

  @IsOptional()
  @IsBoolean()
  suggestToFollowers?: boolean;

  @IsOptional()
  @IsBoolean()
  darkMode?: boolean;

  @IsOptional()
  @IsBoolean()
  autoBackup?: boolean;

  // Admin-specific settings
  @IsOptional()
  @IsBoolean()
  adminAutoApprovePosts?: boolean;

  @IsOptional()
  @IsBoolean()
  adminNewRegistrations?: boolean;
}
