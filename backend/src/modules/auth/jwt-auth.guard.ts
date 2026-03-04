import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log('JwtAuthGuard: Attempting to activate for request');
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (info) {
        console.log('JwtAuthGuard info:', info);
    }
    if (err || !user) {
      console.error('JwtAuthGuard Authentication failed:', err || info);
      throw err || new UnauthorizedException();
    }
    console.log('JwtAuthGuard: User authenticated:', user.email);
    return user;
  }
}