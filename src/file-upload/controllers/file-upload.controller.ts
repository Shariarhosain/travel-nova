import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { FileUploadService } from '../services/file-upload.service';

@Controller('upload')
@UseGuards(AuthGuard('jwt'))
export class FileUploadController {
  constructor(private fileUploadService: FileUploadService) {}

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(@UploadedFile() file: Express.Multer.File) {
    const fileUrl = await this.fileUploadService.uploadSingle(file);
    return { url: fileUrl };
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    const fileUrls = await this.fileUploadService.uploadMultiple(files);
    return { urls: fileUrls };
  }
}
