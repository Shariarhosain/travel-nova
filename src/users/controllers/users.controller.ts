import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from '../services/users.service';

// Simplified controller - user creation and management moved to AuthModule and ProfileModule
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
