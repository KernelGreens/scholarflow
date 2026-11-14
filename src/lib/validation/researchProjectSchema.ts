import { z } from 'zod';

export const privacyLevels = ['PRIVATE', 'SHARED', 'PUBLIC'] as const;
export type PrivacyLevel = (typeof privacyLevels)[number];

export const researchProjectSchema = z.object({
  tenantId: z.string().min(1, 'Tenant identifier is required.').optional(),
  title: z.string().trim().min(3, 'Title must be at least 3 characters.').max(300, 'Title must be at most 300 characters.'),
  shortTitle: z.string().trim().min(2, 'Short title must be at least 2 characters.').max(120, 'Short title must be at most 120 characters.').optional(),
  description: z.string().trim().max(5000, 'Description must be at most 5000 characters.').optional(),
  discipline: z.string().trim().max(200, 'Discipline must be at most 200 characters.').optional(),
  aim: z.string().trim().max(3000, 'Aim must be at most 3000 characters.').optional(),
  institution: z.string().trim().max(200, 'Institution must be at most 200 characters.').optional(),
  programmeType: z.string().trim().max(100, 'Programme type must be at most 100 characters.').optional(),
  startDate: z.iso.date().optional().nullable(),
  targetCompletionDate: z.iso.date().optional().nullable(),
  keywords: z.array(z.string().trim().min(2).max(50)).max(20).default([]),
  tags: z.array(z.string().trim().min(2).max(50)).max(20).default([]),
  privacy: z.enum(privacyLevels).default('PRIVATE'),
});

export type ResearchProjectInput = z.infer<typeof researchProjectSchema>;
