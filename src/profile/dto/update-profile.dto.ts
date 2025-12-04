import {
  IsString,
  IsOptional,
  IsUrl,
  IsDateString,
  IsEnum,
  IsArray,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsArray()
  achievements?: any[];

  @IsOptional()
  @IsArray()
  countriesExplored?: string[];

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;
}
