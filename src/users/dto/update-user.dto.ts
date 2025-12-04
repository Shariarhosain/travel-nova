import { IsEmail, IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';

// Data Transfer Object for updating a user
export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(150)
  age?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
