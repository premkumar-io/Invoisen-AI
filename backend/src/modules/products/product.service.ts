import { Types } from 'mongoose';
import { Product } from './product.model.js';
import { CreateProductInput, UpdateProductInput, GetProductsQuery } from './product.schema.js';

export class ProductService {
  async createProduct(userId: string, data: CreateProductInput) {
    const product = await Product.create({
      userId: new Types.ObjectId(userId),
      ...data,
    });
    return product;
  }

  async getProducts(userId: string, query: GetProductsQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {
      userId: new Types.ObjectId(userId),
      isDeleted: false,
    };

    if (query.category) {
      filter.category = query.category;
    }

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(userId: string, productId: string) {
    const product = await Product.findOne({
      _id: new Types.ObjectId(productId),
      userId: new Types.ObjectId(userId),
      isDeleted: false,
    });

    if (!product) {
      const error = new Error('Product not found') as any;
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return product;
  }

  async updateProduct(userId: string, productId: string, data: UpdateProductInput) {
    const product = await Product.findOneAndUpdate(
      {
        _id: new Types.ObjectId(productId),
        userId: new Types.ObjectId(userId),
        isDeleted: false,
      },
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!product) {
      const error = new Error('Product not found') as any;
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return product;
  }

  async deleteProduct(userId: string, productId: string) {
    const product = await Product.findOneAndUpdate(
      {
        _id: new Types.ObjectId(productId),
        userId: new Types.ObjectId(userId),
        isDeleted: false,
      },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!product) {
      const error = new Error('Product not found') as any;
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return product;
  }
}

export const productService = new ProductService();
