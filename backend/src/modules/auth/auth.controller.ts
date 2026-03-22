import { Body, Controller, Post, Req, UseGuards, HttpCode, BadRequestException, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './application/guards/jwt-auth.guard';
import { tokenBlacklist } from './token-blacklist';
import { Response } from 'express';
import { RegisterDto } from './application/dto/register.dto';
import { LoginDto } from './application/dto/login.dto';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private registerUseCase: RegisterUseCase, private loginUseCase: LoginUseCase) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso' })
  @ApiResponse({ status: 400, description: 'Requisição inválida' })
  async register(@Body() body: RegisterDto, @Req() req: any, @Res({ passthrough: true }) res: Response) {
    if (!body || !body.login || !body.password) {
      throw new BadRequestException({ message: 'Corpo inválido ou ausente' });
    }

    const result = await this.registerUseCase.execute(body as any);
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
  @ApiOperation({ summary: 'Autenticar usuário e obter token' })
  @ApiResponse({ status: 200, description: 'Autenticado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() body: LoginDto, @Req() req: any, @Res({ passthrough: true }) res: Response) {
    if (!body || !body.login || !body.password) {
      throw new BadRequestException({ message: 'Corpo inválido ou ausente' });
    }
    const result = await this.loginUseCase.execute(body as any);
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Encerrar sessão do usuário (logout)' })
  @ApiResponse({ status: 200, description: 'Logout efetuado com sucesso' })
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.token as string | undefined ?? req.user?.token;
    if (token) tokenBlacklist.add(token);
    res.clearCookie('token');
    return { data: { success: true }, error: null };
  }
}
