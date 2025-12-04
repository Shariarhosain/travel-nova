import { IsEmail, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';

// Data Transfer Object for creating a user
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(150)
  age?: number;
}
