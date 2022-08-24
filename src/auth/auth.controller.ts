import {Controller, Post, Body, UseGuards, Request} from '@nestjs/common';
import {UserDto} from "../users/dtos/userDto";
import {AuthService} from "./auth.service";
import {HttpResponse} from "../globalTypes";
import {UserInterface} from "../users/interfaces/user.interface";
import {LocalAuthGuard} from "./local-auth.guard";
import {LoginReturnInterface} from "../auth/interfaces/login.payload";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    /**
     * create user
     * @param body
     */
    @Post('signup')
    async create(@Body() body: UserDto): Promise<HttpResponse<null>> {
        await this.authService.create(body);
        return {
            data: null,
            errors: [],
            message: "User was created successfully",
            status: 200,
            success: true
        }
    }

    /**
     * user login
     * @param req
     */
    @UseGuards(LocalAuthGuard)
    @Post('login')

    async login(@Request() req): Promise<HttpResponse<LoginReturnInterface>> {
        const token: LoginReturnInterface = await this.authService.login(req.user);
        return {
            data: token,
            success: true,
            status: 200,
        }
    }
}
