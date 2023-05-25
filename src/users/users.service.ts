import {Injectable} from '@nestjs/common';
import {UserRepository} from '../repositories/base/user.repository';
import {User, UserDocument} from './schemas/user.schema';
// import {UserInterface} from "./interfaces/user.interface";

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: string): Promise<UserDocument> {
    return await this.userRepository.findById(id);
  }

  async findAll(): Promise<UserDocument[]> {
    return await this.userRepository.findAll();
  }

  async create(user: UserDocument): Promise<UserDocument> {
    return await this.userRepository.create(user);
  }

  async update(id: string, user: Partial<UserDocument>): Promise<UserDocument> {
    return await this.userRepository.updateOne(id, user);
  }

  async delete(id: string): Promise<boolean> {
    return await this.userRepository.deleteOne(id);
  }
  async findByQuery(query: Partial<User>): Promise<UserDocument> {
    return await this.userRepository.find(query);
  }
}
