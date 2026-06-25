import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.userRepo.findOne({ where: { username: dto.username } });
    if (exists) throw new ConflictException('用户名已存在');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      username: dto.username,
      password: hashedPassword,
      email: dto.email,
      company: dto.company,
      phone: dto.phone,
    });
    const saved = await this.userRepo.save(user);
    const { password, ...result } = saved as any;
    return result;
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username = :username', { username: dto.username })
      .getOne();

    if (!user) throw new UnauthorizedException('用户名或密码错误');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('用户名或密码错误');

    const payload = { sub: user.id, username: user.username };
    const { password, ...userInfo } = user as any;
    return {
      access_token: this.jwtService.sign(payload),
      user: userInfo,
    };
  }

  async getProfile(userId: number) {
    return this.userRepo.findOne({ where: { id: userId } });
  }

  async updateProfile(userId: number, data: any) {
    await this.userRepo.update(userId, {
      email: data.email,
      company: data.company,
      phone: data.phone,
      avatar: data.avatar,
    });
    return this.userRepo.findOne({ where: { id: userId } });
  }
}
