import { Types } from 'mongoose';
import { Client } from './client.model.js';
import { CreateClientInput, UpdateClientInput, GetClientsQuery } from './client.schema.js';

export class ClientService {
  async createClient(userId: string, data: CreateClientInput) {
    const client = await Client.create({
      userId: new Types.ObjectId(userId),
      ...data,
    });
    return client;
  }

  async getClients(userId: string, query: GetClientsQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {
      userId: new Types.ObjectId(userId),
      isDeleted: query.trash ? true : false,
    };

    // Search functionality
    if (query.search) {
      filter.$text = { $search: query.search };
    }

    const [clients, total] = await Promise.all([
      Client.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Client.countDocuments(filter),
    ]);

    return {
      clients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getClientById(userId: string, clientId: string) {
    const client = await Client.findOne({
      _id: new Types.ObjectId(clientId),
      userId: new Types.ObjectId(userId),
      isDeleted: false,
    });

    if (!client) {
      const error = new Error('Client not found') as any;
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return client;
  }

  async updateClient(userId: string, clientId: string, data: UpdateClientInput) {
    const client = await Client.findOneAndUpdate(
      {
        _id: new Types.ObjectId(clientId),
        userId: new Types.ObjectId(userId),
        isDeleted: false,
      },
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!client) {
      const error = new Error('Client not found') as any;
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return client;
  }

  async deleteClient(userId: string, clientId: string) {
    const client = await Client.findOneAndUpdate(
      {
        _id: new Types.ObjectId(clientId),
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

    if (!client) {
      const error = new Error('Client not found') as any;
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return client;
  }

  async restoreClient(userId: string, clientId: string) {
    const client = await Client.findOneAndUpdate(
      {
        _id: new Types.ObjectId(clientId),
        userId: new Types.ObjectId(userId),
        isDeleted: true,
      },
      {
        $set: {
          isDeleted: false,
          deletedAt: null,
        },
      },
      { new: true }
    );

    if (!client) {
      const error = new Error('Client not found in trash') as any;
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return client;
  }

  async permanentDeleteClient(userId: string, clientId: string) {
    const client = await Client.findOneAndDelete({
      _id: new Types.ObjectId(clientId),
      userId: new Types.ObjectId(userId),
      isDeleted: true,
    });

    if (!client) {
      const error = new Error('Client not found in trash') as any;
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return client;
  }

  async getAllClientsForDropdown(userId: string) {
    const clients = await Client.find({
      userId: new Types.ObjectId(userId),
      isDeleted: false,
    })
      .select('name email company')
      .sort({ name: 1 })
      .lean();

    return clients;
  }
}

export const clientService = new ClientService();
