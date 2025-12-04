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
  adminNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  emailNotificationsPosts?: boolean;

  @IsOptional()
  @IsBoolean()
  securityAlerts?: boolean;
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
