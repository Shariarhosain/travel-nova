import {
  IsString,
  IsOptional,
  IsUrl,
  IsDateString,
  IsEnum,
  IsArray,
  IsEmail,
  MinLength,
  isString,
} from 'class-validator';
import { Gender } from '@prisma/client';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  currentPassword?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password?: string;

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
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  achievements?: any[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  countriesExplored?: string[];

  @IsOptional()
  @IsString()
  instagramUsername?: string;

  @IsOptional()
  @IsString()
  twitterUsername?: string;

  @IsOptional()
  @IsString()
  facebookUsername?: string;
}
