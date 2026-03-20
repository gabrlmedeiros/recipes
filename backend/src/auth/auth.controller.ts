import { Body, Controller, Post, Req, UseGuards, HttpCode, BadRequestException, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { tokenBlacklist } from './token-blacklist';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto, @Req() req: any, @Res({ passthrough: true }) res: Response) {
    if (!body || !body.login || !body.password) {
      throw new BadRequestException({ message: 'Corpo inválido ou ausente' });
    }

    const result = await this.service.register(body);
    // set HttpOnly cookie with token
    const cookieOptions = {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    const expose = String(req.headers['x-platform'] || '').toLowerCase() === 'mobile';
    if (expose) {
      return { data: result, error: null };
    }
    res.cookie('token', result.token, cookieOptions);
    return { data: result.user, error: null };
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() body: LoginDto, @Req() req: any, @Res({ passthrough: true }) res: Response) {
    if (!body || !body.login || !body.password) {
      throw new BadRequestException({ message: 'Corpo inválido ou ausente' });
    }
    const result = await this.service.login(body);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    const expose = String(req.headers['x-platform'] || '').toLowerCase() === 'mobile';
    if (expose) {
      return { data: result, error: null };
    }
    res.cookie('token', result.token, cookieOptions);
    return { data: result.user, error: null };
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.token as string | undefined ?? req.user?.token;
    if (token) tokenBlacklist.add(token);
    res.clearCookie('token');
    return { data: { success: true }, error: null };
  }
}
