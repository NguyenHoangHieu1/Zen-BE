import {
  Controller,
  Post,
  Body,
  Patch,
  UseGuards,
  Req,
  Inject,
  BadRequestException,
  Get,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { SerializeDecorator } from 'src/cores/interceptors/';
import { EndUser, EndUserSerializeDto } from 'src/modules/users/enduser/';
import {
  RegisterAccountSwaggerAPIDecorators,
  ActivateAccountSwaggerAPIDecorators,
  LoginAccountSwaggerAPIDecorators,
  ForgotPasswordSwaggerAPIDecorators,
  ChangeForgottonPasswordSwaggerAPIDecorators,
} from 'src/documents/swagger-api/auth/';
import {
  RegisterEndUserDto,
  ActivateAccountDto,
  ForgotPasswordDto,
  ChangeForgottonPasswordDto,
} from './dto/';
import { LocalGuard, LoggedInGuard } from './passport/';

import { MailerService } from '@nestjs-modules/mailer';
import { forgotPasswordMail, registerMail } from 'src/common/mails/auth';
import { IAuthService, IAuthServiceString } from './service/auth.interface';
import { AuthRedisService } from './service';
import { QRCode } from 'qrcode';
import { CheckAccountDto } from './dto/check-account.dto';
import { CheckAccountSwaggerAPIDecorators } from 'src/documents/swagger-api/auth/checkAccount.api';
import { EnableOtpDto } from './dto/enable-otp.dto';
import { EnableOtpSwaggerAPIDecorators } from 'src/documents/swagger-api/auth/enableOtp.api';
import { GenerateOtpSwaggerAPIDecorators } from 'src/documents/swagger-api/auth/generateOtp.api';
import { DocumentMongodbType } from 'src/common/types/mongodbTypes';
import { CheckOtpDto } from './dto/check-otp.dto';
import { CheckOtpSwaggerAPIDecorators } from 'src/documents/swagger-api/auth/check-otp.api';
import { DisableOtpDto } from './dto/disable-otp.dto';
import { DisableOtpSwaggerAPIDecorators } from 'src/documents/swagger-api/auth/disableOtp.api';
@ApiTags('Authentication/Authorization')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(IAuthServiceString)
    private readonly authService: IAuthService,
    private readonly authRedisStableService: AuthRedisService,
    private readonly mailerService: MailerService,
  ) {}

  @RegisterAccountSwaggerAPIDecorators()
  @Post('register-account')
  @SerializeDecorator(EndUserSerializeDto)
  async registerAccount(@Body() registerEndUserDto: RegisterEndUserDto) {
    const message = 'This email is already in used. Try another one';

    const isExistedRedis =
      await this.authRedisStableService.isEmailAlreadyRegistered(
        registerEndUserDto.email,
      );

    if (isExistedRedis) {
      throw new BadRequestException(message);
    }
    const isExisted = await this.authService.findAccountFilterQuery({
      email: registerEndUserDto.email,
    });

    if (isExisted) {
      throw new BadRequestException(message);
    }

    const result = await this.authService.registerAccount(registerEndUserDto);

    await this.mailerService.sendMail(
      registerMail(result.email, result.activationToken),
    );

    await this.authRedisStableService.addUserRegisteredToRedis(
      registerEndUserDto.email,
    );
    return result;
  }

  //check the sent activation token  & remove the activate token field in the db
  @ActivateAccountSwaggerAPIDecorators()
  @Get('activate-account/:activationToken')
  async activateAccount(@Param() activateAccountDto: ActivateAccountDto) {
    const account = await this.authService.activateAccount(activateAccountDto);
    if (!account) {
      return `
        <html>
          <head>
            <title>Account Activation Failed</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                height: 100vh;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .container {
                background: white;
                padding: 2rem 3rem;
                border-radius: 10px;
                box-shadow: 0 8px 20px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 500px;
              }
              .icon {
                font-size: 64px;
                color: #dc3545;
                margin-bottom: 1rem;
              }
              h1 {
                color: #dc3545;
                margin-bottom: 1rem;
              }
              p {
                color: #666;
                line-height: 1.6;
                margin-bottom: 1.5rem;
              }
              .button {
                background: #0056b3;
                color: white;
                padding: 12px 24px;
                border-radius: 5px;
                text-decoration: none;
                transition: background 0.3s;
              }
              .button:hover {
                background: #003d82;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">❌</div>
              <h1>Activation Failed</h1>
              <p>We couldn't activate your account. The activation link may be invalid or expired.</p>
              <a href="/" class="button">Return to Homepage</a>
            </div>
          </body>
        </html>
      `;
    }
    return `
      <html>
        <head>
          <title>Account Activated Successfully</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              height: 100vh;
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              padding: 2rem 3rem;
              border-radius: 10px;
              box-shadow: 0 8px 20px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 500px;
            }
            .icon {
              font-size: 64px;
              color: #28a745;
              margin-bottom: 1rem;
            }
            h1 {
              color: #28a745;
              margin-bottom: 1rem;
            }
            p {
              color: #666;
              line-height: 1.6;
              margin-bottom: 1.5rem;
            }
            .button {
              background: #28a745;
              color: white;
              padding: 12px 24px;
              border-radius: 5px;
              text-decoration: none;
              transition: background 0.3s;
            }
            .button:hover {
              background: #218838;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">✅</div>
            <h1>Account Activated!</h1>
            <p>Your account has been successfully activated. You can now log in and start using our services.</p>
            <a href="/login" class="button">Log In Now</a>
          </div>
        </body>
      </html>
    `;
  }

  @LoginAccountSwaggerAPIDecorators()
  @Patch('login-account')
  @UseGuards(LocalGuard)
  @SerializeDecorator(EndUserSerializeDto)
  loginAccount(@Req() req: Request) {
    return req.user;
  }

  @CheckAccountSwaggerAPIDecorators()
  @Post('check-account')
  async checkAccount(@Body() checkAccountDto: CheckAccountDto) {
    const account = await this.authService.checkAccount(checkAccountDto);
    return account;
  }

  @EnableOtpSwaggerAPIDecorators()
  @Patch('enable-otp')
  @SerializeDecorator(EndUserSerializeDto)
  async enableOtp(@Body() enableOtpDto: EnableOtpDto) {
    const account = await this.authService.enableOtp(enableOtpDto);
    return account;
  }

  @DisableOtpSwaggerAPIDecorators()
  @Patch('disable-otp')
  @SerializeDecorator(EndUserSerializeDto)
  async disableOtp(@Body() disableOtpDto: DisableOtpDto) {
    const account = await this.authService.disableOtp(disableOtpDto);
    return account;
  }

  @GenerateOtpSwaggerAPIDecorators()
  @Get('generate-qr')
  async generateOtp() {
    const qrUrl = await this.authService.generateOtp();
    return { qrUrl };
  }

  @ForgotPasswordSwaggerAPIDecorators()
  @Patch('forgot-password')
  @SerializeDecorator(EndUserSerializeDto)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(forgotPasswordDto);
    await this.mailerService.sendMail(
      forgotPasswordMail(result.email, result.modifyToken),
    );
    return result;
  }

  @ChangeForgottonPasswordSwaggerAPIDecorators()
  @Patch('change-forgottent-password')
  @SerializeDecorator(EndUserSerializeDto)
  async changeForgottonPassword(
    @Body() changeForgottonPasswordDto: ChangeForgottonPasswordDto,
  ) {
    const user = await this.authService.changeForgottonPassword(
      changeForgottonPasswordDto,
    );

    await this.authRedisStableService.userConvertToRedisTypeThenHSET(
      user.toObject(),
    );
    return user;
  }

  @CheckOtpSwaggerAPIDecorators()
  @Patch('check-otp')
  async checkOtp(@Body() checkOtpDto: CheckOtpDto) {
    const isVerified = await this.authService.checkOtp(checkOtpDto);
    return { isVerified };
  }
}
