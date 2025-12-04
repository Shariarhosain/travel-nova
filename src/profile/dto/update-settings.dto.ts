import { IsBoolean, IsEmail, IsOptional } from 'class-validator';

export class UpdateNotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  pushNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  emailNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  adminAdminNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  adminSecurityAlerts?: boolean;
}

export class UpdatePrivacySecuritySettingsDto {
  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  enableFaceId?: boolean;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;

  @IsOptional()
  @IsBoolean()
  rememberMeBrowser?: boolean;

  @IsOptional()
  @IsEmail()
  trustedContactEmail?: string;
}
