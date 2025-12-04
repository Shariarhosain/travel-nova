import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.userAccount.findUnique({
      where: { id: payload.sub },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // // Check if account is deactivated (user self-deactivated)
    // if (!user.isActive) {
    //   throw new UnauthorizedException('Account is deactivated');
    // }

    // Check if account is banned (admin banned)
    if (user.accountBanned) {
      throw new UnauthorizedException('Account is banned');
    }

    return user;
  }
}
