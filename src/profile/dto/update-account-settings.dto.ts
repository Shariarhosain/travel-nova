import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateAccountSettingsDto {
  @IsOptional()
  @IsBoolean()
  accountPrivate?: boolean;

  @IsOptional()
  @IsBoolean()
  showActive?: boolean;

  @IsOptional()
  @IsBoolean()
  showFollowers?: boolean;

  @IsOptional()
  @IsBoolean()
  showFollowersList?: boolean;

  @IsOptional()
  @IsBoolean()
  showFollowingList?: boolean;

  @IsOptional()
  @IsBoolean()
  searchByEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  searchByUsername?: boolean;

  @IsOptional()
  @IsBoolean()
  suggestAccount?: boolean;

  @IsOptional()
  @IsBoolean()
  darkMode?: boolean;

  @IsOptional()
  @IsBoolean()
  autoBackup?: boolean;
}
