import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

// Note: User management is now handled by AuthModule and ProfileModule
// This service is kept for reference

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.userAccount.findMany({
      include: {
        profile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.userAccount.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });
  }
}
