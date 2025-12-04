import { Injectable, BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileUploadService {
  private readonly uploadPath = path.join(process.cwd(), 'uploads');

  constructor() {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadSingle(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    this.validateFile(file);

    const filename = this.generateFileName(file);
    const filePath = path.join(this.uploadPath, filename);

    fs.writeFileSync(filePath, file.buffer);

    // Return the URL path (you can modify this to return your CDN URL)
    return `/uploads/${filename}`;
  }

  async uploadMultiple(files: Express.Multer.File[]): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadedFiles: string[] = [];

    for (const file of files) {
      this.validateFile(file);
      const filename = this.generateFileName(file);
      const filePath = path.join(this.uploadPath, filename);

      fs.writeFileSync(filePath, file.buffer);
      uploadedFiles.push(`/uploads/${filename}`);
    }

    return uploadedFiles;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const filename = path.basename(fileUrl);
    const filePath = path.join(this.uploadPath, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  private validateFile(file: Express.Multer.File): void {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed',
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size must not exceed 10MB');
    }
  }

  private generateFileName(file: Express.Multer.File): string {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    return `${uniqueSuffix}${ext}`;
  }

  getFilePath(filename: string): string {
    return path.join(this.uploadPath, filename);
  }
}
