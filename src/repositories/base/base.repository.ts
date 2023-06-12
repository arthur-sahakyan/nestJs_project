import {Injectable} from '@nestjs/common';
import { Document, FilterQuery, UpdateQuery, Model, Types } from 'mongoose';
import {ObjectId} from 'mongoose';

@Injectable()
export class BaseRepository<T extends Document> {
  constructor(private readonly model: Model<T>) {}

  async findAll(): Promise<T[]> {
    return this.model.find().exec();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async create(data: Partial<T>): Promise<T> {
    const newItem = new this.model(data);
    return newItem.save();
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, {new: true}).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndRemove(id).exec();
    return !!result;
  }

  async findByQuery(query: Partial<FilterQuery<T>>): Promise<T[]> {
    return this.model.find(query as FilterQuery<T>).exec();
  }
  async findOneByQuery(query: Partial<FilterQuery<T>>): Promise<T> {
    return this.model.findOne(query as FilterQuery<T>).exec();
  }
}
