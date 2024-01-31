import { SendNumberOtp, User } from '@prisma/client';
import { Secret } from 'jsonwebtoken';

import httpStatus from 'http-status';
import config from '../../../config';
import { ExpireTime, RandomNumber } from '../../../helpers';
import {
  isUserPasswordConvertBcrypt,
  isUserPasswordMatch,
} from '../../../helpers/bcryptHelper';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import { SEND_SMS } from '../../../helpers/smsSender';
import prisma from '../../../shared/prisma';
import { IApiResponse } from '../../../shared/sendResponse';
import { IVerifyOtpProps } from './auth.interface';

//  create user
const createUser = async (
  userData: User
): Promise<IApiResponse<Partial<User>>> => {
  const isUserFound = await prisma.user.findUnique({
    where: {
      mobile: userData?.mobile,
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
  //  check is user
  if (!isUserFound) {
    const newPassword = await isUserPasswordConvertBcrypt(userData?.password);
    const res = await prisma.user.create({
      data: { ...userData, password: newPassword, role: 'customer' },
    });
    const { ...userWithoutPassword } = res;

    return {
      data: userWithoutPassword,
      success: true,
      statusCode: httpStatus.OK,
      message: `Create user ${userWithoutPassword.full_name} successfully!`,
    };
  } else {
    return {
      data: null,
      success: true,
      statusCode: httpStatus.NOT_FOUND,
      message: `User with mobile already exists.`,
    };
  }

  // end
};
//  create user
const createAdmin = async (
  userData: User
): Promise<IApiResponse<Partial<User>>> => {
  const isUserFound = await prisma.user.findUnique({
    where: {
      mobile: userData?.mobile,
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
  //  check is user
  if (!isUserFound) {
    const newPassword = await isUserPasswordConvertBcrypt(userData?.password);
    const res = await prisma.user.create({
      data: { ...userData, password: newPassword, role: 'admin' },
    });
    const { ...userWithoutPassword } = res;

    return {
      data: userWithoutPassword,
      success: true,
      statusCode: httpStatus.OK,
      message: `Create user ${userWithoutPassword.full_name} successfully!`,
    };
  } else {
    return {
      data: null,
      success: true,
      statusCode: httpStatus.NOT_FOUND,
      message: `User with mobile already exists.`,
    };
  }

  // end
};
// login user
const loginUser = async (props: User): Promise<IApiResponse<Partial<User>>> => {
  const res = await prisma.user.findUnique({
    where: {
      mobile: props?.mobile,
    },
  });

  if (res) {
    const { mobile, role, password, ...responseData } = res;
    // check password
    const isMatchPassword = await isUserPasswordMatch(
      props?.password,
      password
    );
    // send
    if (isMatchPassword) {
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
        message: 'Login successfully',
        statusCode: httpStatus.OK,
        success: true,
        data: {
          ...responseData,
          access_token: accessToken,
          refresh_token: refreshToken,
        },
      };
    } else {
      return {
        message: 'Password is incorrect!',
        success: false,
        statusCode: httpStatus.NOT_FOUND,
        data: null,
      };
    }
  } else {
    return {
      data: null,
      message: 'Number is incorrect!',
      success: false,
      statusCode: httpStatus.NOT_FOUND,
    };
  }
};
//  send otp
const sendOtp = async (props: SendNumberOtp) => {
  const otp = RandomNumber(5);
  const expireTime = ExpireTime();

  const data = {
    mobile: props?.mobile,
    otp: otp,
    expire_time: `${expireTime}`,
  };
  // database
  const res = await prisma.sendNumberOtp.create({
    data: data,
  });

  // Send SMS
  const smsMessage = `Wish Me: Your OTP is ${data.otp}. Use it to verify you phone  number. Expire in 2 minutes.`;
  await SEND_SMS(data.mobile, smsMessage);

  return {
    data: res,
    message: 'Check  your sms for the OTP',
    success: true,
    statusCode: httpStatus.OK,
  };
};
// verifyOtp
const verifyOtp = async (props: IVerifyOtpProps) => {
  // database
  const res = await prisma.sendNumberOtp.findFirst({
    where: {
      mobile: props?.mobile,
    },
    orderBy: {
      updated_at: 'desc',
    },
  });

  if (res) {
    if (
      res?.mobile === props?.mobile &&
      Number(res?.otp) === Number(props?.otp)
    ) {
      //  delete otp
      await prisma.sendNumberOtp.delete({
        where: {
          id: res?.id,
        },
      });

      return {
        data: {
          module: res?.mobile,
        },
        message: 'Number Verification Successfully',
        statusCode: httpStatus.OK,
        success: true,
      };
    } else {
      return {
        message: "Otp doesn't match",
        statusCode: httpStatus.NOT_FOUND,
        success: false,
      };
    }
  } else {
    return {
      data: null,
      message: 'Mobile number not match',
    };
  }
};
// const forgetPassword = async (props: SendNumberOtp)=>{

// }
// export
export const AuthService = {
  createUser,
  loginUser,
  createAdmin,
  sendOtp,
  verifyOtp,
};