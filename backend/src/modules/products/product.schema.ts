import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  description: z.string().max(1000).optional().default(''),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  category: z.enum(['service', 'product', 'subscription', 'other']).optional().default('service'),
  sku: z.string().max(100).optional().default(''),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  unitPrice: z.number().min(0).optional(),
  category: z.enum(['service', 'product', 'subscription', 'other']).optional(),
  sku: z.string().max(100).optional(),
});

export const getProductsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
  category: z.string().optional(),
});

export const productIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type GetProductsQuery = z.infer<typeof getProductsSchema>;
