import { SendNumberOtp, User } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import sendResponse from '../../../shared/sendResponse';
import { AuthService } from './auth.service';

//  Create user
const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.createUser(req?.body);
    sendResponse<Partial<User>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Create user successfully!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Create Admin
const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.createUser(req?.body);
    sendResponse<Partial<User>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Create admin successfully!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
// LoginAuth
const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.loginUser(req?.body);
    sendResponse<Partial<User>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Login successfully!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
// send Otp number
const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.sendOtp(req?.body);
    sendResponse<Partial<SendNumberOtp>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Otp send check  your phone sms',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

//  otp verification
const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.verifyOtp(req?.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Verification otp successfully!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
//
const forgetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await AuthService.forgetPassword(req?.body);
    sendResponse<Partial<SendNumberOtp>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Update information successfully!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await AuthService.resetPassword(req?.body);
    sendResponse<Partial<SendNumberOtp>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Update information successfully!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// update user
const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req?.body;
  const id = req?.params?.id;

  try {
    const result = await AuthService.updateUser(id, payload);
    sendResponse<Partial<User>>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Update information successfully!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

//  auth
export const AuthController = {
  createUser,
  loginUser,
  createAdmin,
  sendOtp,
  verifyOtp,
  forgetPassword,
  resetPassword,
  updateUser,
};
