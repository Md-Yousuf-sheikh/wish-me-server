import { Wish } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { WishesFilterAbleFields } from './wishes.constant';
import { WishesService } from './wishes.service';

// create
const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await WishesService.insertIntoDB(req?.body);
  sendResponse<Wish>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Wish create successfully',
    data: result,
  });
});
// get all
const getAllFormDB = catchAsync(async (req: Request, res: Response) => {
  // const id = '6cc0fff9-0adb-4cca-a957-23a1c6714d80';
  const filters = pick(req.query, WishesFilterAbleFields);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

  const result = await WishesService.getAllFormDB(filters, options);

  sendResponse<Wish[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Wishes get successfully',
    data: result,
  });
});
//  update
const updateFormDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await WishesService.updateFormDB(id, payload);
  sendResponse<Wish>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Wishes updated successfully',
    data: result,
  });
});
// delete
const deleteFormDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await WishesService.deleteFormDB(id);
  sendResponse<Wish>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Wishes delete successfully',
    data: result,
  });
});
//  update
const getByIdFormDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await WishesService.getByIdFormDB(id);
  sendResponse<Partial<Wish>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Get wishes successfully',
    data: result,
  });
});

//  export
export const WishesController = {
  insertIntoDB,
  getAllFormDB,
  updateFormDB,
  deleteFormDB,
  getByIdFormDB,
};
