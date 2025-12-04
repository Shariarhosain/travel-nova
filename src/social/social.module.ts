import { Module } from '@nestjs/common';
import { SocialService } from './services/social.service';
import { SocialController } from './controllers/social.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [SocialController],
  providers: [SocialService, PrismaService],
  exports: [SocialService],
})
export class SocialModule {}
