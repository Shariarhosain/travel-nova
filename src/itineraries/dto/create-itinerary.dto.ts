import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Visibility } from '@prisma/client';

export class BestTimeToVisitDto {
  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsOptional()
  @IsString()
  temperature?: string;
}

export class AttractionDto {
  @IsOptional()
  @IsString()
  imageLink?: string;

  @IsOptional()
  @IsString()
  attractionName?: string;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class HotelDto {
  @IsOptional()
  @IsString()
  imageLink?: string;

  @IsString()
  hotelName: string;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  amenities?: string[];
}

export class CreateItineraryDto {
  @IsOptional()
  @IsString()
  mainImageLink?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsNumber()
  durationDays?: number;

  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BestTimeToVisitDto)
  bestTimeToVisit?: BestTimeToVisitDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AttractionDto)
  attractions?: AttractionDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => HotelDto)
  hotels?: HotelDto[];
}
