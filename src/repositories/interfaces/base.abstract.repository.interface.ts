export abstract class IBaseRepository<T> {
  abstract findAll(): Promise<T[]>;

  abstract find(params: {[key in keyof T]: T[key]}): Promise<T>;

  abstract findOneById(id: string): Promise<T>;

  abstract create(item: T): Promise<T>;

  abstract update(id: string, item: T);

  abstract findByCondition(filterCondition: any): Promise<any>;

  abstract remove(id: string): Promise<any>;
}
