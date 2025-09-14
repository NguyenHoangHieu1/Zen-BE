import { DocumentMongodbType } from 'src/common/types/mongodbTypes';
import {
  ActivateAccountDto,
  ChangeForgottonPasswordDto,
  ForgotPasswordDto,
  LoginEndUserDto,
  RegisterEndUserDto,
} from '../dto';
import { EndUser } from 'src/modules/users/enduser';
import { FilterQuery } from 'mongoose';
import { CheckAccountDto } from '../dto/check-account.dto';
import { EnableOtpDto } from '../dto/enable-otp.dto';
import { CheckOtpDto } from '../dto/check-otp.dto';
import { DisableOtpDto } from '../dto/disable-otp.dto';

export const IAuthServiceString = 'IAuthService';

export interface IAuthService {
  registerAccount(
    registerEndUserDto: RegisterEndUserDto,
  ): Promise<DocumentMongodbType<EndUser>>;

  findAccountFilterQuery(
    filterQuery: FilterQuery<EndUser>,
  ): Promise<DocumentMongodbType<EndUser> | null>;

  activateAccount(
    activateAccountDto: ActivateAccountDto,
  ): Promise<DocumentMongodbType<EndUser>>;

  loginAccount(loginEndUserDto: LoginEndUserDto): Promise<EndUser>;

  forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<DocumentMongodbType<EndUser>>;

  changeForgottonPassword(
    changeForgottonPasswordDto: ChangeForgottonPasswordDto,
  ): Promise<DocumentMongodbType<EndUser>>;

  checkAccount(
    checkAccountDto: CheckAccountDto,
  ): Promise<DocumentMongodbType<EndUser>>;

  enableOtp(enableOtpDto: EnableOtpDto): Promise<DocumentMongodbType<EndUser>>;

  generateOtp(): Promise<string>;

  checkOtp(checkOtpDto: CheckOtpDto): Promise<boolean>;

  disableOtp(
    disableOtpDto: DisableOtpDto,
  ): Promise<DocumentMongodbType<EndUser>>;
}
