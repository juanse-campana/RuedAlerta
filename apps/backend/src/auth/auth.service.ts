import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'node:crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly database: DatabaseService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const email = this.normalizeEmail(dto.email);
    const existing = await this.database.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email is already registered');

    const user = await this.database.user.create({
      data: { email, passwordHash: await argon2.hash(dto.password) },
    });
    return this.issueTokens(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const email = this.normalizeEmail(dto.email);
    const user = await this.database.user.findUnique({ where: { email } });
    if (!user || !(await argon2.verify(user.passwordHash, dto.password)) || user.accountStatus !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens(user.id, user.email);
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const session = await this.database.refreshSession.findUnique({ where: { tokenHash }, include: { user: true } });
    if (!session || session.revokedAt || session.expiresAt <= new Date() || session.user.accountStatus !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid refresh token');
    }
    await this.database.refreshSession.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
    return this.issueTokens(session.user.id, session.user.email);
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await this.database.refreshSession.updateMany({ where: { tokenHash, revokedAt: null }, data: { revokedAt: new Date() } });
  }

  private async issueTokens(userId: string, email: string) {
    const accessToken = await this.jwt.signAsync({ sub: userId, email }, { expiresIn: ACCESS_TTL_SECONDS });
    const refreshToken = randomBytes(48).toString('base64url');
    await this.database.refreshSession.create({
      data: { userId, tokenHash: this.hashToken(refreshToken), expiresAt: new Date(Date.now() + REFRESH_TTL_MS) },
    });
    return { accessToken, refreshToken, expiresIn: ACCESS_TTL_SECONDS };
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
