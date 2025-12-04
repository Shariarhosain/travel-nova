import { Module } from '@nestjs/common';
import { PostsService } from './services/posts.service';
import { PostsController } from './controllers/posts.controller';
import { PrismaService } from '../common/prisma.service';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [FileUploadModule],
  controllers: [PostsController],
  providers: [PostsService, PrismaService],
  exports: [PostsService],
})
export class PostsModule {}
