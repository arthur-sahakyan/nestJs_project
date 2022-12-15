import {
  Controller,
  Get,
  Param,
  Delete,
  Res,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import {UsersService} from './users.service';
import {UserInterface} from './interfaces/user.interface';
import {UserDto} from './dtos/userDto';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {HttpResponse} from '../globalTypes';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * get all users
   */
  @Get()
  async findAll(): Promise<HttpResponse<UserInterface[]>> {
    const users: UserInterface[] = await this.usersService.findAll();
    return {
      data: users,
      errors: [],
      message: '',
      status: 200,
      success: true,
    };
  }

  /**
   * get user by id
   * @param res
   * @param id
   */
  @Get(':id')
  async findById(
    @Param('id') id: string,
  ): Promise<HttpResponse<UserInterface | null>> {
    const user: UserInterface = await this.usersService.findById(id);
    return {
      data: user,
      errors: [],
      message: '',
      status: 200,
      success: true,
    };
  }

  /**
   * delete user
   * @param id
   */
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<HttpResponse<null>> {
    await this.usersService.delete(id);
    return {
      data: null,
      errors: [],
      message: 'User was deleted successfully',
      status: 200,
      success: true,
    };
  }

  /**
   * update user
   * @param id
   * @param body
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UserDto,
  ): Promise<HttpResponse<UserInterface | null>> {
    const user: UserInterface = await this.usersService.update(id, body);
    return {
      data: user,
      errors: [],
      message: 'User was updated successfully',
      status: 200,
      success: true,
    };
  }
}
