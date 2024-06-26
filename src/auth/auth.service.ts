import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { ApiResponse } from 'src/constants/apiResponse';
import { User } from 'src/users/schemas/user.schema';
import { UserService } from 'src/users/user.service';

export interface TokenPayload {
  userId: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async login(user: User | null, response: Response, message: string = '') {
    const tokenPayload: TokenPayload = {
      userId: user._id.toHexString(),
      email: user.email,
    };

    const expires = new Date();
    expires.setSeconds(
      expires.getSeconds() + this.configService.get('JWT_EXPIRATION'),
    );

    const token = this.jwtService.sign(tokenPayload);

    user = this.userService.deleteUnwantedFields(user);

    const res = new ApiResponse(message, null, 201, {
      user,
    });
    response
      .cookie('Authentication', token, {
        httpOnly: true,
        expires,
      })
      .status(200)
      .send(res.getResponse());
  }

  logout(response: Response) {
    const res = new ApiResponse('User logged out', null, 201, null);
    response
      .cookie('Authentication', '', {
        httpOnly: true,
        expires: new Date(),
      })
      .status(200)
      .send(res.getResponse());
  }
}
