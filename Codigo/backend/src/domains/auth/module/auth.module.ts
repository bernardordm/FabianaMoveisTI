/* eslint-disable */
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../../users/module/users.module';
import { AuthService } from '../service/auth.service';
import { JwtStrategy } from '../stategies/jwt.strategy';
import { AuthController } from '../controller/auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {UsersService} from "../../users/service/users.service";

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '1h'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: JwtStrategy,
      useFactory: (usersService, configService, authService) => {
        return new JwtStrategy(usersService, configService, authService);
      },
      inject: [UsersService, ConfigService, AuthService],
    }
  ],
  exports: [AuthService],
})
export class AuthModule {}