import { Module } from '@nestjs/common';
import { DiscoverService } from './services/discover.service';
import { DiscoverController } from './controllers/discover.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [DiscoverController],
  providers: [DiscoverService, PrismaService],
})
export class DiscoverModule {}
