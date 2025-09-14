import * as speakeasy from 'speakeasy';

const secret2FA1 = speakeasy.generateSecret({
  name: 'twofa',
});

console.log(secret2FA1);

const secret2FA = {
  ascii: '*aK^m>$UUqFH<k1Qh$fe:}s{FQMlP?Ah',
  hex: '2a614b5e6d3e2455557146483c6b3151682466653a7d737b46514d6c503f4168',
  base32: 'FJQUWXTNHYSFKVLRIZEDY2ZRKFUCIZTFHJ6XG62GKFGWYUB7IFUA',
  otpauth_url:
    'otpauth://totp/twofa?secret=FJQUWXTNHYSFKVLRIZEDY2ZRKFUCIZTFHJ6XG62GKFGWYUB7IFUA',
};

export default secret2FA;
