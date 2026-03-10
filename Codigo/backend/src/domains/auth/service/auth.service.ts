/* eslint-disable */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/service/users.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  // Lista de tokens invalidados (blacklist)
  private invalidatedTokens: Set<string> = new Set();

  constructor(
      private usersService: UsersService,
      private jwtService: JwtService,
      private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
  }

  login(user: any) {
    const payload = { sub: user.id, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
      },
    };
  }

  logout(token: string): { success: boolean; message: string } {
    try {
      const tokenValue = token.startsWith('Bearer ')
          ? token.slice(7)
          : token;

      if (this.invalidatedTokens.has(tokenValue)) {
        throw new UnauthorizedException('Token já foi invalidado anteriormente');
      }

      this.jwtService.verify(tokenValue);

      this.invalidatedTokens.add(tokenValue);

      return {
        success: true,
        message: 'Logout realizado com sucesso',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token inválido');
    }
  }

  isTokenInvalidated(token: string): boolean {
    return this.invalidatedTokens.has(token);
  }

  async refreshToken(token: string) {
    try {
      // Verifica se o token está na blacklist
      if (this.invalidatedTokens.has(token)) {
        throw new UnauthorizedException('Token já foi invalidado');
      }

      const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
      const fallbackSecret = this.configService.get<string>('JWT_SECRET');
      const secret = refreshSecret || fallbackSecret;

      const payload = this.jwtService.verify(token, {
        secret: secret,
      });

      const user = await this.usersService.findOne(payload.sub);

      const newPayload = { sub: user.id, email: user.email };

      return {
        access_token: this.jwtService.sign(newPayload),
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          cargo: user.cargo,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Token de atualização inválido');
    }
  }
}