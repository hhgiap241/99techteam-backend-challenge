import type { Request, Response, NextFunction } from 'express';
import { authenticateToken, authorizeRoles } from '../../../src/middleware/auth.middleware';
import * as JwtUtil from '../../../src/utils/jwt.util';
import { DatabaseService } from '../../../src/database/connection';
import type { User } from '../../../src/entities';
import { UserRole } from '../../../src/enums';
import type { Repository } from 'typeorm';

// Mock dependencies
jest.mock('../../../src/utils/jwt.util');
jest.mock('../../../src/database/connection', () => ({
  DatabaseService: {
    getInstance: jest.fn(),
  },
}));

const mockJwtUtil = JwtUtil as jest.Mocked<typeof JwtUtil>;
const mockDatabaseService = jest.mocked(DatabaseService);

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockUserRepository: Partial<Repository<User>>;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    mockUserRepository = {
      findOne: jest.fn(),
    };

    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockUserRepository),
    };

    const mockDatabaseServiceInstance = {
      getDataSource: () => mockDataSource,
    };

    mockDatabaseService.getInstance.mockReturnValue(mockDatabaseServiceInstance as unknown as ReturnType<typeof DatabaseService.getInstance>);

    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.CUSTOMER,
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        orders: [],
        toJSON: jest.fn(),
      } as unknown as User;

      const mockPayload = {
        userId: 'user-1',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      mockJwtUtil.extractTokenFromHeader.mockReturnValue('valid-token');
      mockJwtUtil.verifyAccessToken.mockReturnValue(mockPayload);
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwtUtil.extractTokenFromHeader).toHaveBeenCalledWith('Bearer valid-token');
      expect(mockJwtUtil.verifyAccessToken).toHaveBeenCalledWith('valid-token');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
      expect(mockRequest.user).toBe(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject request without authorization header', async () => {
      mockRequest.headers = {};
      mockJwtUtil.extractTokenFromHeader.mockReturnValue(null);

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access token required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject invalid token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      mockJwtUtil.extractTokenFromHeader.mockReturnValue('invalid-token');
      const jwtError = new Error('Invalid token');
      jwtError.name = 'JsonWebTokenError';
      mockJwtUtil.verifyAccessToken.mockImplementation(() => {
        throw jwtError;
      });

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject expired token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer expired-token',
      };

      mockJwtUtil.extractTokenFromHeader.mockReturnValue('expired-token');
      const expiredError = new Error('Token expired');
      expiredError.name = 'TokenExpiredError';
      mockJwtUtil.verifyAccessToken.mockImplementation(() => {
        throw expiredError;
      });

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token expired',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle user not found', async () => {
      const mockPayload = {
        userId: 'nonexistent-user',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      mockJwtUtil.extractTokenFromHeader.mockReturnValue('valid-token');
      mockJwtUtil.verifyAccessToken.mockReturnValue(mockPayload);
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token - user not found',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('authorizeRoles', () => {
    it('should allow access for authorized role', () => {
      const mockUser = {
        id: 'user-1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: UserRole.ADMIN,
        toJSON: jest.fn(),
      } as unknown as User;

      mockRequest.user = mockUser;
      const authorizeMiddleware = authorizeRoles(UserRole.ADMIN);

      authorizeMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject access for unauthorized role', () => {
      const mockUser = {
        id: 'user-1',
        email: 'customer@example.com',
        name: 'Customer User',
        role: UserRole.CUSTOMER,
        toJSON: jest.fn(),
      } as unknown as User;

      mockRequest.user = mockUser;
      const authorizeMiddleware = authorizeRoles(UserRole.ADMIN);

      authorizeMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
