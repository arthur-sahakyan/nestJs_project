import {BaseRepository} from './base.repository.interface';
import {UserDocument} from '../../users/schemas/user.schema';
import {User} from '../../users/schemas/user.schema';

export interface UserRepository extends BaseRepository<UserDocument> {
  find(criteria: Partial<User>): Promise<UserDocument[]>;
  findById(id: string): Promise<UserDocument>;
  findAll(): Promise<UserDocument[]>;
  create(item: UserDocument): Promise<UserDocument>;
  // update(id: string, item: UserDocument): Promise<T>;
  delete(id: any): Promise<void>;
}
