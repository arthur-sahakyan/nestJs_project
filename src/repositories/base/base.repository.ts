import { Injectable } from '@nestjs/common';
import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';

@Injectable()
export abstract class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id).exec();
  }

  async find(filter: FilterQuery<T>): Promise<T | null> {
    return await this.model.findOne(filter).exec();
  }

  async findAll(): Promise<T[]> {
    return await this.model.find().exec();
  }

  async create(entity: T): Promise<T> {
    return await this.model.create(entity);
  }

  async updateOne(id: string, entity: UpdateQuery<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, entity, { new: true }).exec();
  }

  async deleteOne(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }
}