import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from './product.controller.js';
import {
  createProductSchema,
  updateProductSchema,
  getProductsSchema,
  productIdSchema,
} from './product.schema.js';

export const productRouter = Router();

productRouter.use(requireAuth);

productRouter.get('/', validate(getProductsSchema, 'query'), listProducts);
productRouter.post('/', validate(createProductSchema), createProduct);
productRouter.get('/:id', validate(productIdSchema, 'params'), getProduct);
productRouter.patch('/:id', validate(productIdSchema, 'params'), validate(updateProductSchema), updateProduct);
productRouter.delete('/:id', validate(productIdSchema, 'params'), deleteProduct);
