import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import {
  ActivateAccountDto,
  ChangeForgottonPasswordDto,
  ForgotPasswordDto,
  LoginEndUserDto,
  RegisterEndUserDto,
} from '../dto';
import { EndUser } from 'src/modules/users/enduser/';
import { v4 } from 'uuid';
import { checkingToConvertToObjectFromDocument } from 'src/common/utils/';

import { FilterQuery } from 'mongoose';
import { isNullOrUndefined } from 'src/common/utils/';
import { AuthRepository } from '../repository/auth.repository';
import { BaseRepositoryName } from 'src/cores/base-repository/Base.Repository.interface';
import { IAuthService } from './auth.interface';
import secret2FA from 'src/common/constants/twofa';
import * as speakeasy from 'speakeasy';
import { CheckAccountDto } from '../dto/check-account.dto';
import * as QRCode from 'qrcode';
import { EnableOtpDto } from '../dto/enable-otp.dto';
import { DocumentMongodbType } from 'src/common/types/mongodbTypes';
import { CheckOtpDto } from '../dto/check-otp.dto';
import { DisableOtpDto } from '../dto/disable-otp.dto';
@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(BaseRepositoryName)
    private readonly authRepsitory: AuthRepository,
  ) {}

  async registerAccount(registerEndUserDto: RegisterEndUserDto) {
    const hashedPassword = await bcrypt.hash(
      registerEndUserDto.password,
      +process.env.BCRYPT_HASH,
    );

    const accountInfo: Partial<EndUser> = {
      ...registerEndUserDto,
      password: hashedPassword,
      activationToken: v4(),
      otpEnabled: false,
    };
    const createdAccount = await this.authRepsitory.create(accountInfo);

    return createdAccount;
  }

  async findAccountFilterQuery(filterQuery: FilterQuery<EndUser>) {
    return this.authRepsitory.findOne(filterQuery);
  }

  async activateAccount({ activationToken }: ActivateAccountDto) {
    const inactivateAccount = await this.authRepsitory.findOne({
      activationToken,
    });

    if (isNullOrUndefined(inactivateAccount)) {
      return null;
    }

    // Set To undefined so the property in mongodb document remove the field entirely
    inactivateAccount.activationToken = undefined;
    const activatedAccount = inactivateAccount;

    return activatedAccount.save();
  }

  async loginAccount(loginEndUserDto: LoginEndUserDto) {
    const existedAccount = await this.authRepsitory.findOne({
      email: loginEndUserDto.email,
    });
    if (isNullOrUndefined(existedAccount)) {
      throw new UnauthorizedException('This account does not exist');
    }

    if (existedAccount.activationToken) {
      throw new UnauthorizedException(
        'This account has not been activated, please go to your email account to activate it',
      );
    }
    const isMatchedPassword = await bcrypt.compare(
      loginEndUserDto.password,
      existedAccount.password,
    );

    if (!isMatchedPassword) {
      throw new UnauthorizedException('Invalid Password');
    }

    const convertedExistedAccount =
      checkingToConvertToObjectFromDocument(existedAccount);

    return convertedExistedAccount;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.authRepsitory.findOne({
      email: forgotPasswordDto.email,
    });

    if (isNullOrUndefined(user)) {
      throw new UnauthorizedException("You don't have the access");
    }
    user.modifyToken = v4();

    const savedUser = await user.save();

    return savedUser;
  }

  async changeForgottonPassword(
    changeForgottonPasswordDto: ChangeForgottonPasswordDto,
  ) {
    const existedAccount = await this.authRepsitory.findOne({
      modifyToken: changeForgottonPasswordDto.modifyToken,
    });

    if (!existedAccount) {
      throw new UnauthorizedException("You don't have access to this!");
    }
    existedAccount.modifyToken = undefined;
    existedAccount.password = await bcrypt.hash(
      changeForgottonPasswordDto.password,
      +process.env.BCRYPT_HASH,
    );

    return existedAccount.save();
  }

  async generateOtp() {
    const qrUrl = await QRCode.toDataURL(secret2FA.otpauth_url);
    return qrUrl;
  }

  async enableOtp(enableOtpDto: EnableOtpDto) {
    const account = await this.authRepsitory.findOne({
      email: enableOtpDto.email,
    });

    if (!account) {
      throw new UnauthorizedException('This account does not exist');
    }

    const isVerified = speakeasy.totp.verify({
      secret: secret2FA.ascii,
      encoding: 'ascii',
      token: enableOtpDto.otp,
    });

    if (!isVerified) {
      throw new UnauthorizedException('Invalid OTP');
    }

    account.otpEnabled = true;
    return account.save();
  }

  async checkAccount(checkAccountDto: CheckAccountDto) {
    const account = await this.authRepsitory.findOne({
      email: checkAccountDto.email,
    });

    if (isNullOrUndefined(account)) {
      throw new UnauthorizedException('This account does not exist');
    }

    const isMatchedPassword = await bcrypt.compare(
      checkAccountDto.password,
      account.password,
    );

    if (!isMatchedPassword) {
      throw new UnauthorizedException('Invalid Password');
    }

    return account;
  }

  async checkOtp(checkOtpDto: CheckOtpDto) {
    const isVerified = speakeasy.totp.verify({
      secret: secret2FA.ascii,
      encoding: 'ascii',
      token: checkOtpDto.otp,
    });

    return isVerified;
  }

  async disableOtp(disableOtpDto: DisableOtpDto) {
    const account = await this.authRepsitory.findOne({
      email: disableOtpDto.email,
    });

    if (!account) {
      throw new UnauthorizedException('This account does not exist');
    }

    const isVerified = speakeasy.totp.verify({
      secret: secret2FA.ascii,
      encoding: 'ascii',
      token: disableOtpDto.otp,
    });

    if (!isVerified) {
      throw new UnauthorizedException('Invalid OTP');
    }

    account.otpEnabled = false;
    return account.save();
  }
}
