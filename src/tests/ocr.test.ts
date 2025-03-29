import { recognizeText, detectTables, detectStructuralElements } from '../lib/ocr';
import { OCRResult, Table, StructuralElement } from '../types/ocr';
import path from 'path';

describe('OCR Service', () => {
  describe('recognizeText', () => {
    it('should recognize text from an image', async () => {
      const result = await recognizeText('test-image.jpg');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle low confidence text recognition', async () => {
      const imagePath = path.join(__dirname, '../test/fixtures/low-quality.png');
      const result = await recognizeText(imagePath);
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should throw error for invalid image path', async () => {
      const imagePath = 'invalid/path.png';
      
      await expect(recognizeText(imagePath)).rejects.toThrow();
    });
  });

  describe('detectTables', () => {
    it('should detect tables from an image', async () => {
      const result = await detectTables('test-image.jpg');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle images without tables', async () => {
      const imagePath = path.join(__dirname, '../test/fixtures/no-table.png');
      const tables = await detectTables(imagePath);
      
      expect(Array.isArray(tables)).toBe(true);
      expect(tables.length).toBe(0);
    });
  });

  describe('detectStructuralElements', () => {
    it('should detect structural elements from an image', async () => {
      const result = await detectStructuralElements('test-image.jpg');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should correctly identify different element types', async () => {
      const imagePath = path.join(__dirname, '../test/fixtures/mixed-elements.png');
      const elements = await detectStructuralElements(imagePath);
      
      const types = elements.map(e => e.type);
      expect(types).toContain('pillar');
      expect(types).toContain('beam');
      expect(types).toContain('slab');
    });

    it('should extract correct dimensions', async () => {
      const imagePath = path.join(__dirname, '../test/fixtures/dimensions.png');
      const elements = await detectStructuralElements(imagePath);
      
      const pillar = elements.find(e => e.type === 'pillar');
      expect(pillar?.dimensions).toHaveProperty('width');
      expect(pillar?.dimensions).toHaveProperty('height');
      
      const beam = elements.find(e => e.type === 'beam');
      expect(beam?.dimensions).toHaveProperty('width');
      expect(beam?.dimensions).toHaveProperty('height');
      
      const slab = elements.find(e => e.type === 'slab');
      expect(slab?.dimensions).toHaveProperty('thickness');
    });
  });

  describe('Error Handling', () => {
    it('should handle corrupted images', async () => {
      const imagePath = path.join(__dirname, '../test/fixtures/corrupted.png');
      
      await expect(recognizeText(imagePath)).rejects.toThrow();
    });

    it('should handle empty images', async () => {
      const imagePath = path.join(__dirname, '../test/fixtures/empty.png');
      
      await expect(recognizeText(imagePath)).rejects.toThrow();
    });

    it('should handle unsupported file formats', async () => {
      const imagePath = path.join(__dirname, '../test/fixtures/unsupported.txt');
      
      await expect(recognizeText(imagePath)).rejects.toThrow();
    });
  });

  describe('Performance', () => {
    it('should process large images within timeout', async () => {
      const imagePath = path.join(__dirname, '../test/fixtures/large.png');
      const start = Date.now();
      
      await recognizeText(imagePath);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(30000); // 30 segundos
    });

    it('should handle multiple requests efficiently', async () => {
      const imagePath = path.join(__dirname, '../test/fixtures/simple-text.png');
      const requests = Array(5).fill(imagePath);
      
      const start = Date.now();
      await Promise.all(requests.map(path => recognizeText(path)));
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(10000); // 10 segundos
    });
  });
}); 