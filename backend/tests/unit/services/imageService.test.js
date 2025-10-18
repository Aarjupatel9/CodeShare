/**
 * Unit Tests for Image Service
 */

const imageService = require('../../../services/imageService');
const fixtures = require('../../helpers/fixtures');
const fs = require('fs').promises;
const path = require('path');

describe('ImageService', () => {
  describe('processTeamLogo', () => {
    it('should optimize image to less than 50KB', async () => {
      const buffer = await fixtures.generateTestImage(300, 300);
      const result = await imageService.processTeamLogo(buffer, 'test-logo.png');

      expect(result).toHaveProperty('buffer');
      expect(result).toHaveProperty('mimeType');
      expect(result).toHaveProperty('size');
      expect(result.size).toBeLessThan(50 * 1024); // Less than 50KB
      expect(result.mimeType).toBe('image/webp');
      expect(result.optimized).toBe(true);
    });

    it('should resize large images to max 200x200', async () => {
      const buffer = await fixtures.generateTestImage(500, 500);
      const result = await imageService.processTeamLogo(buffer, 'large-logo.png');

      const sharp = require('sharp');
      const metadata = await sharp(result.buffer).metadata();

      expect(metadata.width).toBeLessThanOrEqual(200);
      expect(metadata.height).toBeLessThanOrEqual(200);
    });

    it('should handle large images by optimizing them', async () => {
      // Note: Sharp's WebP compression is so good that even large images
      // often compress to < 50KB. This test verifies optimization works.
      const largeBuffer = await fixtures.generateLargeTestImage();
      const result = await imageService.processTeamLogo(largeBuffer, 'large-logo.png');

      // Should still optimize to reasonable size
      expect(result.size).toBeLessThan(100 * 1024); // Less than 100KB
      expect(result.mimeType).toBe('image/webp');
    });

    it('should convert to WebP format', async () => {
      const buffer = await fixtures.generateTestImage(150, 150);
      const result = await imageService.processTeamLogo(buffer, 'test.png');

      expect(result.mimeType).toBe('image/webp');
      expect(result.buffer).toBeInstanceOf(Buffer);
    });
  });

  describe('base64 conversion', () => {
    it('should convert buffer to base64', () => {
      const testBuffer = Buffer.from('test data');
      const result = imageService.bufferToBase64(testBuffer, 'image/webp');

      expect(result).toContain('data:image/webp;base64,');
      expect(typeof result).toBe('string');
    });

    it('should convert base64 back to buffer', () => {
      const testBuffer = Buffer.from('test data');
      const base64 = imageService.bufferToBase64(testBuffer, 'image/webp');
      const result = imageService.base64ToBuffer(base64);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toBe('test data');
    });
  });

  describe('public folder operations', () => {
    const testTeamId = 'test-team-12345';

    afterEach(async () => {
      // Cleanup test files
      await imageService.deleteFromPublicFolder(testTeamId);
    });

    it('should save image to public folder', async () => {
      const buffer = await fixtures.generateTestImage(100, 100);
      const result = await imageService.saveToPublicFolder(testTeamId, buffer);

      expect(result).toHaveProperty('publicPath');
      expect(result).toHaveProperty('filepath');
      expect(result.publicPath).toContain('/team-logos/');
      expect(result.publicPath).toContain(`${testTeamId}.webp`);
    });

    it('should retrieve image from public folder', async () => {
      const buffer = await fixtures.generateTestImage(100, 100);
      await imageService.saveToPublicFolder(testTeamId, buffer);

      const result = await imageService.getFromPublicFolder(testTeamId);

      expect(result).not.toBeNull();
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.mimeType).toBe('image/webp');
      expect(result.size).toBeGreaterThan(0);
    });

    it('should return null for non-existent image', async () => {
      const result = await imageService.getFromPublicFolder('non-existent-team');

      expect(result).toBeNull();
    });

    it('should delete image from public folder', async () => {
      const buffer = await fixtures.generateTestImage(100, 100);
      await imageService.saveToPublicFolder(testTeamId, buffer);

      // Delete
      await imageService.deleteFromPublicFolder(testTeamId);

      // Verify deleted
      const result = await imageService.getFromPublicFolder(testTeamId);
      expect(result).toBeNull();
    });
  });
});

