import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [UsersController],
  providers: [
    PrismaService,
    UsersService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
