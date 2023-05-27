export interface BaseRepository<T> {
  find(criteria: Partial<T>): Promise<T[]>;
  findById(id: string): Promise<T>;
  findAll(): Promise<T[]>;
  create(item: T): Promise<T>;
  // update(id: string, item: T): Promise<T>;
  delete(id: string): Promise<void>;
}