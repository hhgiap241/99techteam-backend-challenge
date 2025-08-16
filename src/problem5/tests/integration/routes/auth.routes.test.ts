import request from 'supertest';
import express from 'express';
import authRoutes from '../../../src/routes/auth.routes';
import * as PasswordUtil from '../../../src/utils/password.util';
import * as JwtUtil from '../../../src/utils/jwt.util';
import { DatabaseService } from '../../../src/database/connection';
import type { User } from '../../../src/entities';
import { UserRole } from '../../../src/enums';
import type { Repository } from 'typeorm';

// Mock dependencies
jest.mock('../../../src/utils/password.util');
jest.mock('../../../src/utils/jwt.util');
jest.mock('../../../src/database/connection', () => ({
  DatabaseService: {
    getInstance: jest.fn(),
  },
}));
jest.mock('../../../src/middleware/auth.middleware', () => ({
  authenticateToken: (req: any, _res: any, next: any) => {
    req.user = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: UserRole.CUSTOMER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    next();
  },
}));

const mockPasswordUtil = PasswordUtil as jest.Mocked<typeof PasswordUtil>;
const mockJwtUtil = JwtUtil as jest.Mocked<typeof JwtUtil>;
const mockDatabaseService = jest.mocked(DatabaseService);

describe('Auth Routes', () => {
  let app: express.Application;
  let mockUserRepository: Partial<Repository<User>>;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);

    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    jest.clearAllMocks();

    // Setup database service mock after clearing
    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockUserRepository),
    };

    const mockDatabaseServiceInstance = {
      getDataSource: () => mockDataSource,
    };

    mockDatabaseService.getInstance.mockReturnValue(mockDatabaseServiceInstance as unknown as ReturnType<typeof DatabaseService.getInstance>);
  });

  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
      };

      const mockUser = {
        id: 'user-1',
        email: userData.email,
        name: userData.name,
        role: UserRole.CUSTOMER,
      };

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null); // User doesn't exist
      mockPasswordUtil.validatePassword.mockReturnValue({ valid: true, errors: [] });
      mockPasswordUtil.hashPassword.mockResolvedValue('hashed-password');
      (mockUserRepository.create as jest.Mock).mockReturnValue(mockUser);
      (mockUserRepository.save as jest.Mock).mockResolvedValue(mockUser);
      mockJwtUtil.generateTokenPair.mockReturnValue(mockTokens);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
            role: mockUser.role,
          },
          tokens: mockTokens,
        },
      });
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' }); // Missing password and name

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Email, password, and name are required',
      });
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123!',
          name: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Invalid email format',
      });
    });

    it('should return 400 for invalid password', async () => {
      mockPasswordUtil.validatePassword.mockReturnValue({
        valid: false,
        errors: ['Password must be at least 8 characters'],
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak',
          name: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Password validation failed',
        errors: ['Password must be at least 8 characters'],
      });
    });

    it('should return 409 for existing user', async () => {
      const existingUser = { id: 'existing-user' };
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(existingUser);

      // Mock password validation to pass
      mockPasswordUtil.validatePassword.mockReturnValue({ valid: true, errors: [] });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'SecurePass123!',
          name: 'Existing User',
        });

      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({
        success: false,
        message: 'User with this email already exists',
      });
    });
  });

  describe('POST /login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      const mockUser = {
        id: 'user-1',
        email: loginData.email,
        name: 'Test User',
        role: UserRole.CUSTOMER,
        password: 'hashed-password',
      };

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      mockPasswordUtil.comparePassword.mockResolvedValue(true);
      mockJwtUtil.generateTokenPair.mockReturnValue(mockTokens);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
            role: mockUser.role,
          },
          tokens: mockTokens,
        },
      });
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' }); // Missing password

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Email and password are required',
      });
    });

    it('should return 401 for non-existent user', async () => {
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password',
        });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Invalid email or password',
      });
    });

    it('should return 401 for invalid password', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashed-password',
      };

      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      mockPasswordUtil.comparePassword.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrong-password',
        });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Invalid email or password',
      });
    });
  });

  describe('POST /refresh', () => {
    it('should refresh tokens successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
      };

      const mockPayload = {
        userId: 'user-1',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
      };

      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      mockJwtUtil.verifyRefreshToken.mockReturnValue(mockPayload);
      mockJwtUtil.generateTokenPair.mockReturnValue(mockTokens);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'valid-refresh-token' });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        message: 'Tokens refreshed successfully',
        data: { tokens: mockTokens },
      });
    });

    it('should return 400 for missing refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Refresh token is required',
      });
    });

    it('should return 401 for invalid refresh token', async () => {
      const jwtError = new Error('Invalid token');
      jwtError.name = 'JsonWebTokenError';
      mockJwtUtil.verifyRefreshToken.mockImplementation(() => {
        throw jwtError;
      });

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    });
  });

  describe('GET /profile', () => {
    it('should return user profile successfully', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user: {
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User',
            role: UserRole.CUSTOMER,
          },
        },
      });
    });
  });
});
