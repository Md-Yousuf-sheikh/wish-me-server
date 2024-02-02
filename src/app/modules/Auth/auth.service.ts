import { SendNumberOtp, User } from '@prisma/client';
import { Secret } from 'jsonwebtoken';

import httpStatus from 'http-status';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import {
  isCurrentTimeMatch,
  isExpireTime,
  isRandomNumber,
} from '../../../helpers';
import {
  isUserPasswordConvertBcrypt,
  isUserPasswordMatch,
} from '../../../helpers/bcryptHelper';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import { SEND_SMS } from '../../../helpers/smsSender';
import prisma from '../../../shared/prisma';
import { IVerifyOtpProps } from './auth.interface';

//  create user
const createUser = async (userData: User): Promise<Partial<User>> => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      mobile: userData?.mobile,
    },
  });

  if (isUserExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Mobile number already exists');
  }

  const newPassword = await isUserPasswordConvertBcrypt(userData?.password);
  const res = await prisma.user.create({
    data: {
      ...userData,
      password: newPassword,
      role: userData?.role ?? 'customer',
    },
    select: {
      full_name: true,
      mobile: true,
      profile_image: true,
      access_token: true,
      refresh_token: true,
      role: true,
      email: true,
      status: true,
      id: true,
      is_phone_number_verified: true,
      work_status: true,
    },
  });
  const { ...userWithoutPassword } = res;

  return userWithoutPassword;

  // end
};
//  create admin
const createAdmin = async (userData: User): Promise<Partial<User>> => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      mobile: userData?.mobile,
    },
  });

  if (isUserExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Mobile number already exists');
  }

  const newPassword = await isUserPasswordConvertBcrypt(userData?.password);
  const res = await prisma.user.create({
    data: {
      ...userData,
      password: newPassword,
      role: userData?.role ?? 'admin',
    },
    select: {
      full_name: true,
      mobile: true,
      profile_image: true,
      access_token: true,
      refresh_token: true,
      role: true,
      email: true,
      status: true,
      id: true,
      is_phone_number_verified: true,
      work_status: true,
    },
  });
  const { ...userWithoutPassword } = res;

  return userWithoutPassword;

  // end
};

// login user
const loginUser = async (props: User): Promise<Partial<User>> => {
  const res = await prisma.user.findUnique({
    where: {
      mobile: props?.mobile,
    },
  });

  if (!res) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Mobile number not found');
  }

  const { mobile, role, password, ...responseData } = res;
  // check password
  const isMatchPassword = await isUserPasswordMatch(props?.password, password);

  if (!isMatchPassword) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Password does not match');
  }

  // access Token
  const accessToken = jwtHelpers.createToken(
    { mobile, role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );
  // refresh Token
  const refreshToken = jwtHelpers.createToken(
    { mobile, role },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return {
    ...responseData,
    access_token: accessToken,
    refresh_token: refreshToken,
  };
};
//  send otp
const sendOtp = async (props: SendNumberOtp) => {
  const otp = isRandomNumber(5);
  const expireTime = isExpireTime();

  const data = {
    mobile: props?.mobile,
    otp: otp,
    expire_time: expireTime,
  };

  // database
  const res = await prisma.sendNumberOtp.create({
    data: data,
  });

  // Send SMS
  const smsMessage = `Wish Me: Your OTP is ${data.otp}. Use it to verify you phone  number. Expire in 2 minutes.`;
  await SEND_SMS(data.mobile, smsMessage);

  return res;
};
// verifyOtp
const verifyOtp = async (props: IVerifyOtpProps) => {
  // check number is ex
  const res = await prisma.sendNumberOtp.findFirst({
    where: {
      mobile: props?.mobile,
    },
    orderBy: {
      updated_at: 'desc',
    },
  });
  // mobile number not found
  if (!res) throw new ApiError(httpStatus.NOT_FOUND, 'Mobile number not found');

  //  check otp match or not
  if (Number(res?.otp) !== Number(props?.otp))
    throw new ApiError(httpStatus.NOT_FOUND, "Otp doesn't match!");

  //  check otp expire time  or not
  const isTimeNotExpire = isCurrentTimeMatch(res?.expire_time);

  if (!isTimeNotExpire)
    throw new ApiError(httpStatus.NOT_FOUND, 'Expire otp time!');

  await prisma.sendNumberOtp.deleteMany({
    where: {
      mobile: res?.mobile,
    },
  });

  return {
    module: res?.mobile,
  };
};
//  forget password
const forgetPassword = async (props: SendNumberOtp) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      mobile: props?.mobile,
    },
  });

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not  Found!');
  }
  if (isUserExist?.status === 'inactive') {
    throw new ApiError(httpStatus.NOT_FOUND, 'User is  InActive!');
  }

  //
  const otp = isRandomNumber(5);
  const expireTime = isExpireTime();
  const data = {
    mobile: props?.mobile,
    otp: otp,
    expire_time: expireTime,
  };

  // database
  const res = await prisma.sendNumberOtp.create({
    data: data,
  });

  // Send SMS
  const smsMessage = `Wish Me: Your OTP is ${data.otp}. Use it to verify you phone  number. Expire in 2 minutes.`;
  await SEND_SMS(data.mobile, smsMessage);

  // return
  return res;
};
//  reset password
const resetPassword = async (props: User): Promise<Partial<User>> => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      mobile: props?.mobile,
    },
    select: {
      full_name: true,
      mobile: true,
    },
  });
  //  check is user
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not  Found!');
  }

  const newPassword = await isUserPasswordConvertBcrypt(props?.password);

  const res = await prisma.user.update({
    where: {
      mobile: props.mobile,
    },
    data: {
      password: newPassword,
    },
  });
  return res;
  // end
};
// update user
const updateUser = async (
  id: string,
  payload: Partial<User>
): Promise<Partial<User>> => {
  const res = await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      full_name: payload?.full_name,
      profile_image: payload?.profile_image,
      work_status: payload?.work_status,
    },
  });

  return res;
  // end
};

// export
export const AuthService = {
  createUser,
  loginUser,
  createAdmin,
  sendOtp,
  verifyOtp,
  forgetPassword,
  resetPassword,
  updateUser,
};
