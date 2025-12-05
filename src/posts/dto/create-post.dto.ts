import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Visibility } from '@prisma/client';

export class CreatePostDto {
  @IsOptional()
  @IsArray()
  imageLinks?: string[];

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // Handle comma-separated string from form-data
      return value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
    // Handle array from JSON
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
