import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const BCRYPT_SALT_ROUNDS = 10;

// ── 3 platform groups — all internal DB roles map to one of these ──
const CORE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'ORGANIZER'];
const CREW_ROLES = ['VOLUNTEER', 'SCANNER'];
// ENTHUSIAST = default for all other users

function computePortal(roleNames: string[]): { group: string; redirectTo: string } {
  if (roleNames.some((r) => CORE_ROLES.includes(r))) return { group: 'CORE', redirectTo: '/core/dashboard' };
  if (roleNames.some((r) => CREW_ROLES.includes(r))) return { group: 'CREW', redirectTo: '/crew/dashboard' };
  return { group: 'ENTHUSIAST', redirectTo: '/events' };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { roles: { include: { role: true } } },
    });

    if (!user) throw new UnauthorizedException('Invalid email or password');
    if (!user.isActive) throw new UnauthorizedException('Account deactivated. Contact support.');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid email or password');

    const roleNames = user.roles.map((ur) => ur.role.name);
    const { group, redirectTo } = computePortal(roleNames);

    // Issue JWT access token for roadmap API
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      group,
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: roleNames,
      group,       // 'CORE' | 'CREW' | 'ENTHUSIAST'
      redirectTo,
      accessToken, // JWT for roadmap endpoints
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('An account with this email already exists');

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    // Ensure ENTHUSIAST role exists in DB (upsert — idempotent)
    const enthusiastRole = await this.prisma.role.upsert({
      where: { name: 'ENTHUSIAST' },
      update: {},
      create: {
        name: 'ENTHUSIAST',
        description: 'Default public event participant role',
        permissions: [],
      },
    });

    // Create user and immediately assign ENTHUSIAST role
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        password: hashedPassword,
        roles: { create: [{ roleId: enthusiastRole.id }] },
      },
      include: { roles: { include: { role: true } } },
    });

    const roleNames = user.roles.map((ur) => ur.role.name);
    const { group, redirectTo } = computePortal(roleNames);

    // Issue JWT access token for roadmap API
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      group,
    });

    const role = user.role || group.toLowerCase();

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        role: role.toLowerCase(),
        roles: roleNames,
        group,
        accessToken,
      },
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: roleNames,
      group,
      redirectTo,
      accessToken, // JWT for roadmap endpoints
      message: 'Account created successfully.',
    };
  }

  // ── Access Control & Permissions Methods ──

  async checkPermissions(userId: string, permission?: string) {
    if (!userId) return { success: true, permissions: [], hasPermission: false };

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    // Core administrators inherently have full privileges
    if (user?.role === 'core') {
      return {
        success: true,
        permissions: ['create_event', 'edit_event', 'manage_announcements', 'scan_ticket', 'view_analytics'],
        hasPermission: true,
      };
    }

    const activePerms = await this.prisma.crewPermission.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
    });

    const permissions = activePerms.map((p) => p.permission);
    const hasPermission = permission ? permissions.includes(permission) : true;

    return {
      success: true,
      permissions,
      hasPermission,
    };
  }

  async getAllPermissions() {
    const users = await this.prisma.user.findMany({
      where: {
        role: { in: ['crew', 'volunteer', 'scanner', 'CREW', 'VOLUNTEER', 'SCANNER'] },
      },
      include: {
        crewPermissions: {
          where: {
            expiresAt: { gt: new Date() },
          },
        },
      },
      orderBy: { firstName: 'asc' },
    });

    const crew = users.map((u) => {
      const initials = `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase() || 'CM';
      return {
        id: u.id,
        name: `${u.firstName} ${u.lastName}`.trim() || u.email,
        email: u.email,
        role: u.role || 'crew',
        avatar: {
          photo: u.avatar || null,
          initials,
          color: '#FF9900',
        },
        isActive: u.isActive,
        permissions: u.crewPermissions.map((p) => ({
          id: p.id,
          permission: p.permission,
          expiresAt: p.expiresAt.toISOString(),
          grantedAt: p.grantedAt.toISOString(),
          grantedById: p.grantedById || '',
          grantedByName: 'Core Admin',
        })),
      };
    });

    return {
      success: true,
      crew,
    };
  }

  async grantPermission(userId: string, permission: string, durationMinutes?: number, grantedById?: string) {
    const duration = durationMinutes && durationMinutes > 0 ? durationMinutes : 52560000;
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);

    const record = await this.prisma.crewPermission.upsert({
      where: {
        userId_permission: {
          userId,
          permission,
        },
      },
      update: {
        expiresAt,
        grantedById: grantedById || null,
        grantedAt: new Date(),
      },
      create: {
        userId,
        permission,
        expiresAt,
        grantedById: grantedById || null,
      },
    });

    return {
      success: true,
      permission: record,
    };
  }

  async revokePermission(userId: string, permission: string) {
    await this.prisma.crewPermission.deleteMany({
      where: {
        userId,
        permission,
      },
    });

    return {
      success: true,
      message: 'Permission revoked successfully.',
    };
  }

  async getMembers() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const mapped = users.map((u) => {
      const initials = `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase() || 'U';
      return {
        id: u.id,
        name: `${u.firstName} ${u.lastName}`.trim() || u.email,
        email: u.email,
        role: u.role || 'enthusiasts',
        avatar: {
          photo: u.avatar || null,
          initials,
          color: u.role === 'core' ? '#FF9900' : '#4F46E5',
        },
        banned: !u.isActive,
      };
    });

    return {
      success: true,
      users: mapped,
      data: { users: mapped },
    };
  }

  async manageMember(body: any) {
    if (body.action === 'register') {
      const existing = await this.prisma.user.findUnique({ where: { email: body.email } });
      if (existing) throw new ConflictException('An account with this email already exists');

      const hashedPassword = await bcrypt.hash(body.password || 'TemporaryPass123!', BCRYPT_SALT_ROUNDS);
      const nameParts = (body.name || '').trim().split(' ');
      const firstName = nameParts[0] || 'Member';
      const lastName = nameParts.slice(1).join(' ') || '';
      const roleStr = (body.role || 'crew').toLowerCase();

      const user = await this.prisma.user.create({
        data: {
          email: body.email,
          firstName,
          lastName,
          password: hashedPassword,
          role: roleStr,
          isActive: true,
        },
      });

      return {
        success: true,
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
          role: user.role,
        },
      };
    }

    if (body.action === 'unban' || body.action === 'activate') {
      await this.prisma.user.update({
        where: { id: body.userId },
        data: { isActive: true },
      });
      return { success: true };
    }

    return { success: false, error: 'Unknown action' };
  }

  async deactivateMember(id: string) {
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    return { success: true };
  }
}
