import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { LogoutDto } from '../dto/logout.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { VerifyResetCodeDto } from '../dto/verify-reset-code.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any) {
    return this.authService.googleLogin(req.user);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {
    // Initiates Facebook OAuth flow
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthRedirect(@Req() req: any) {
    return this.authService.facebookLogin(req.user);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: any) {
    return req.user;
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req: any) {
    return this.authService.logout(req.user.id);
  }

  @Post('logout-all')
  @UseGuards(AuthGuard('jwt'))
  async logoutAll(@Req() req: any) {
    return this.authService.removeAllDevices(req.user.id);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('verify-reset-code')
  async verifyResetCode(@Body() verifyResetCodeDto: VerifyResetCodeDto) {
    return this.authService.verifyResetCode(verifyResetCodeDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
