import { Model, Types } from 'mongoose';
import { NotFoundError } from './errors.js';

export async function assertOwnership<T extends { userId: Types.ObjectId }>(
  ModelClass: Model<T>,
  resourceId: string,
  userId: string,
  extraFilter: Record<string, unknown> = {}
): Promise<T> {
  if (!Types.ObjectId.isValid(resourceId)) {
    throw new NotFoundError();
  }

  const doc = await ModelClass.findOne({
    _id: new Types.ObjectId(resourceId),
    userId: new Types.ObjectId(userId),
    ...extraFilter,
  });

  if (!doc) {
    throw new NotFoundError();
  }

  return doc;
}
