import {Injectable} from '@nestjs/common';
import {UserRepository} from '../repositories/base/user.repository';
import {UserDocument} from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: string): Promise<UserDocument> {
    return this.userRepository.findById(id);
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userRepository.findAll();
  }

  async create(user: Partial<UserDocument>): Promise<UserDocument> {
    return this.userRepository.create(user);
  }

  async update(id: string, user: Partial<UserDocument>): Promise<UserDocument> {
    return this.userRepository.update(id, user);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async findByQuery(query: Partial<UserDocument>): Promise<UserDocument[]> {
    return this.userRepository.findByQuery(query);
  }

  async updateUserAvatar(userId: string, avatar: string,): Promise<UserDocument> {
    return await this.userRepository.update(userId, {avatar});
  }
}
