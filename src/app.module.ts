import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { APP_GUARD } from '@nestjs/core';
@Module({
  imports: [UserModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: AuthMiddleware,
  },],
})
export class AppModule { }
