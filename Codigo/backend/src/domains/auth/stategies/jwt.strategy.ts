/* eslint-disable */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/service/users.service';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../service/auth.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
      private usersService: UsersService,
      private configService: ConfigService,
      private authService: AuthService,
  ) {
    const jwtSecret =
        configService.get<string>('JWT_SECRET') || 'fallback-secret-key';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {

    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];


    if (token && this.authService.isTokenInvalidated(token)) {
      throw new UnauthorizedException('Token invalidado por logout');
    }

    const user = await this.usersService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      userId: payload.sub,
      email: payload.email,
      nome: user.nome,
      cargo: user.cargo
    };
  }
}