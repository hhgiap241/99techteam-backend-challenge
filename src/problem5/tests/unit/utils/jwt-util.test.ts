import { generateTokenPair, verifyAccessToken, verifyRefreshToken } from '../../../src/utils/jwt.util';
import { UserRole } from '../../../src/enums';

describe('JWT Utilities', () => {
  const testPayload = {
    userId: 'test-user-123',
    email: 'test@example.com',
    role: UserRole.CUSTOMER
  };

  describe('generateTokenPair', () => {
    it('should generate access and refresh tokens', () => {
      // Act
      const tokens = generateTokenPair(testPayload);

      // Assert
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
      expect(tokens.accessToken.length).toBeGreaterThan(0);
      expect(tokens.refreshToken.length).toBeGreaterThan(0);
    });

    it('should handle admin role', () => {
      // Arrange
      const adminPayload = {
        ...testPayload,
        role: UserRole.ADMIN
      };

      // Act
      const tokens = generateTokenPair(adminPayload);

      // Assert
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      // Arrange
      const tokens = generateTokenPair(testPayload);

      // Act
      const decoded = verifyAccessToken(tokens.accessToken);

      // Assert
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.role).toBe(testPayload.role);
    });

    it('should throw error for invalid access token', () => {
      // Arrange
      const invalidToken = 'invalid.token.here';

      // Act & Assert
      expect(() => verifyAccessToken(invalidToken)).toThrow();
    });

    it('should throw error for malformed token', () => {
      // Arrange
      const malformedToken = 'not-a-jwt-token';

      // Act & Assert
      expect(() => verifyAccessToken(malformedToken)).toThrow();
    });

    it('should throw error for refresh token used as access token', () => {
      // Arrange
      const tokens = generateTokenPair(testPayload);

      // Act & Assert
      expect(() => verifyAccessToken(tokens.refreshToken)).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      // Arrange
      const tokens = generateTokenPair(testPayload);

      // Act
      const decoded = verifyRefreshToken(tokens.refreshToken);

      // Assert
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(testPayload.userId);
    });

    it('should throw error for invalid refresh token', () => {
      // Arrange
      const invalidToken = 'invalid.refresh.token';

      // Act & Assert
      expect(() => verifyRefreshToken(invalidToken)).toThrow();
    });

    it('should throw error for access token used as refresh token', () => {
      // Arrange
      const tokens = generateTokenPair(testPayload);

      // Act & Assert
      expect(() => verifyRefreshToken(tokens.accessToken)).toThrow();
    });

    it('should throw error for malformed refresh token', () => {
      // Arrange
      const malformedToken = 'not.a.valid.refresh.token';

      // Act & Assert
      expect(() => verifyRefreshToken(malformedToken)).toThrow();
    });
  });
});
