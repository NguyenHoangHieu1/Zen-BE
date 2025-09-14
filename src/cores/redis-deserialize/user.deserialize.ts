import { ObjectToHashType } from 'src/common/types/redisTypes/ObjectToHash.redis.type';
import {
  convertToBooleanBasedOnStringMeaning,
  checkToConvertToMongoIdOrThrowError,
} from 'src/common/utils/';
import { EndUser } from 'src/modules/users/enduser/entities/enduser.entity';

export function userDeserialize(endUser: ObjectToHashType<EndUser>): EndUser {
  return {
    ...endUser,
    _id: checkToConvertToMongoIdOrThrowError({
      id: endUser._id,
      returnError: false,
    }),
    isBanned: convertToBooleanBasedOnStringMeaning(endUser.isBanned),
    isOnline: convertToBooleanBasedOnStringMeaning(endUser.isOnline),
    restrict: JSON.parse(endUser.restrict),
    createdAt: new Date(parseInt(endUser.createdAt)),
    updatedAt: new Date(parseInt(endUser.updatedAt)),
    offlineTime: new Date(parseInt(endUser.offlineTime)),
    otpEnabled: convertToBooleanBasedOnStringMeaning(endUser.otpEnabled),
    expireTimeForModifyToken: new Date(
      parseInt(endUser.expireTimeForModifyToken),
    ),
  };
}
