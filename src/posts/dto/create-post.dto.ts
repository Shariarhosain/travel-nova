import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';
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
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
