import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/requireAuth.js';
import { productService } from './product.service.js';
import { sendSuccess } from '../../utils/response.js';

export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;
    const product = await productService.createProduct(userId, req.body);
    return sendSuccess(res, product, 201);
  } catch (error) {
    next(error);
  }
};

export const listProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;
    const result = await productService.getProducts(userId, req.query as any);
    return sendSuccess(res, result.products, 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;
    const id = req.params.id as string;
    const product = await productService.getProductById(userId, id);
    return sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;
    const id = req.params.id as string;
    const product = await productService.updateProduct(userId, id, req.body);
    return sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;
    const id = req.params.id as string;
    await productService.deleteProduct(userId, id);
    return sendSuccess(res, { message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};
