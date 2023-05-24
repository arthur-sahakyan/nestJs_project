import {Model, Schema as MongooseSchema} from 'mongoose';
import {IBaseRepository} from '../interfaces/base.abstract.repository.interface';

export class BaseRepository<T> implements IBaseRepository<T> {
  private _repository: Model<T>;

  constructor(repository: Model<T>) {
    this._repository = repository;
  }

  async findAll(): Promise<T[]> {
    return this._repository.find();
  }

  async find(params: Partial<{[key in keyof T]: T[key]}>): Promise<T> {
    return this._repository.findOne(params).lean();
  }

  async findByCondition(filterCondition: any): Promise<any> {
    return this._repository.find({$where: filterCondition});
  }

  async findOneById(id: string | MongooseSchema.Types.ObjectId): Promise<T> {
    return this._repository.findById(id);
  }

  async create(item: T | any): Promise<T> {
    return this._repository.create(item);
  }

  async update(id: string | MongooseSchema.Types.ObjectId, item: Partial<T>) {
    return this._repository.findByIdAndUpdate(id, item);
  }

  async remove(id: string): Promise<any> {
    return this._repository.deleteOne({id});
  }
}
