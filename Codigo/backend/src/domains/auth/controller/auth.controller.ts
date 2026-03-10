/* eslint-disable */
import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { LoginDto } from '../dtos/login.dto';
import { JwtAuthGuard } from '../jwt/jwt.auth.guard';
import { GetUser } from '../decorator/get-user.decorator';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { LogoutDto } from '../dtos/logout.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@GetUser() user: any) {
    return {
      id: user.userId,
      email: user.email,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify')
  verifyToken() {
    return { authenticated: true };
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  @Post('logout')
  async logout(@Headers('authorization') authHeader: string) {
    return this.authService.logout(authHeader);
  }

  @Post('logout-with-body')
  async logoutWithBody(@Body() logoutDto: LogoutDto) {
    return this.authService.logout(logoutDto.token);
  }
}
