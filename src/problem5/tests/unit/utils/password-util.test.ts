import { hashPassword, comparePassword } from '../../../src/utils/password.util';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      // Arrange
      const plainPassword = 'MySecurePassword123!';

      // Act
      const hashedPassword = await hashPassword(plainPassword);

      // Assert
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(50);
      expect(hashedPassword).toMatch(/^\$2[aby]\$/);
    });

    it('should produce different hashes for the same password', async () => {
      // Arrange
      const plainPassword = 'SamePassword123!';

      // Act
      const hash1 = await hashPassword(plainPassword);
      const hash2 = await hashPassword(plainPassword);

      // Assert
      expect(hash1).not.toBe(hash2);
      expect(hash1).toBeDefined();
      expect(hash2).toBeDefined();
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password and hash', async () => {
      // Arrange
      const plainPassword = 'CorrectPassword123!';
      const hashedPassword = await hashPassword(plainPassword);

      // Act
      const isMatch = await comparePassword(plainPassword, hashedPassword);

      // Assert
      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password and hash', async () => {
      // Arrange
      const correctPassword = 'CorrectPassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hashedPassword = await hashPassword(correctPassword);

      // Act
      const isMatch = await comparePassword(wrongPassword, hashedPassword);

      // Assert
      expect(isMatch).toBe(false);
    });
  });
});
