import {BaseRepository} from '../base/base.abstract.repository';
import {User} from '../../users/schemas/user.schema';

export type UserRepositoryInterface = BaseRepository<User>;
