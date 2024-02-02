import { User } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';

// update user
const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req?.body;
  const id = req?.params?.id;

  try {
    const result = await UserService.updateUser(id, payload);
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

export const UserController = {
  updateUser,
};
