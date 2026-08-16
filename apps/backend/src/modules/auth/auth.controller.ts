import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password — returns user, roles, and redirectTo portal' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // ── Access Control & Permission Management Endpoints ──

  @Get('permissions/check')
  @ApiOperation({ summary: 'Check active permission status for a user' })
  async checkPermissions(
    @Query('userId') userId: string,
    @Query('permission') permission?: string,
  ) {
    return this.authService.checkPermissions(userId, permission);
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Get all crew members and their active permissions' })
  async getPermissions() {
    return this.authService.getAllPermissions();
  }

  @Post('permissions')
  @ApiOperation({ summary: 'Grant or extend a temporary permission for a crew member' })
  async grantPermission(
    @Body() body: { userId: string; permission: string; durationMinutes?: number; grantedById?: string },
    @Headers('x-user-id') callerId?: string,
  ) {
    return this.authService.grantPermission(
      body.userId,
      body.permission,
      body.durationMinutes,
      body.grantedById || callerId,
    );
  }

  @Delete('permissions')
  @ApiOperation({ summary: 'Revoke a permission from a user' })
  async revokePermission(
    @Query('userId') userId: string,
    @Query('permission') permission: string,
  ) {
    return this.authService.revokePermission(userId, permission);
  }

  // ── Members Directory & Account Management ──

  @Get()
  @ApiOperation({ summary: 'List all platform members for access control directory' })
  async getMembers() {
    return this.authService.getMembers();
  }

  @Post()
  @ApiOperation({ summary: 'Manage member account (register new, unban, etc.)' })
  async manageMember(@Body() body: any) {
    return this.authService.manageMember(body);
  }

  @Delete()
  @ApiOperation({ summary: 'Deactivate a member account' })
  async deactivateMember(@Query('id') id: string) {
    return this.authService.deactivateMember(id);
  }
}
