import { Module } from '@nestjs/common';
import { ProfileService } from './services/profile.service';
import { ProfileController } from './controllers/profile.controller';
import { PrismaService } from '../common/prisma.service';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [FileUploadModule],
  controllers: [ProfileController],
  providers: [ProfileService, PrismaService],
  exports: [ProfileService],
})
export class ProfileModule {}
