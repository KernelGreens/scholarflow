import { describe, expect, it } from 'vitest';
import { researchProjectSchema } from './researchProjectSchema';

describe('researchProjectSchema', () => {
  it('accepts a valid research project input', () => {
    const result = researchProjectSchema.safeParse({
      tenantId: 'tenant_123',
      title: 'Design and evaluation of AI workflow intelligence',
      shortTitle: 'AI-WIF',
      description: 'A doctoral project.',
      discipline: 'Computer Science',
      aim: 'To design the framework.',
      privacy: 'PRIVATE',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a title that is too short', () => {
    const result = researchProjectSchema.safeParse({
      tenantId: 'tenant_123',
      title: 'AI',
      privacy: 'PRIVATE',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an invalid privacy level', () => {
    const result = researchProjectSchema.safeParse({
      tenantId: 'tenant_123',
      title: 'Valid title',
      privacy: 'SECRET',
    });

    expect(result.success).toBe(false);
  });

  it('defaults keywords and tags to empty arrays', () => {
    const result = researchProjectSchema.safeParse({
      tenantId: 'tenant_123',
      title: 'Valid title',
      privacy: 'PRIVATE',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.keywords).toEqual([]);
      expect(result.data.tags).toEqual([]);
      expect(result.data.privacy).toBe('PRIVATE');
    }
  });

  it('rejects a keyword longer than 50 characters', () => {
    const result = researchProjectSchema.safeParse({
      tenantId: 'tenant_123',
      title: 'Valid title',
      keywords: ['a'.repeat(51)],
      privacy: 'PRIVATE',
    });

    expect(result.success).toBe(false);
  });
});
