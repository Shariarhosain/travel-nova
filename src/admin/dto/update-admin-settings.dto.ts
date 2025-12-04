import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateAdminSettingsDto {
  @IsOptional()
  @IsBoolean()
  adminAutoApprovePosts?: boolean;

  @IsOptional()
  @IsBoolean()
  adminNewRegistrations?: boolean;
}
