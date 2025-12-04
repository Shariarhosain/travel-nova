import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

// Note: This repository uses the old User model which no longer exists.
// The app now uses UserAccount. This file is kept for reference but not used.
// User management is handled through AuthModule and ProfileModule.

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.userAccount.findMany({
      include: {
        profile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return users;
  }

  async findOne(id: string) {
    const user = await this.prisma.userAccount.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });
    return user;
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
