import { Module } from '@nestjs/common';
import { ItinerariesService } from './services/itineraries.service';
import { ItinerariesController } from './controllers/itineraries.controller';
import { PrismaService } from '../common/prisma.service';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [FileUploadModule],
  controllers: [ItinerariesController],
  providers: [ItinerariesService, PrismaService],
  exports: [ItinerariesService],
})
export class ItinerariesModule {}
