import { Prisma, Wish } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { WishesSearchAbleFields } from './wishes.constant';
import { IWishesFilterRequest } from './wishes.interface';

// create
const insertIntoDB = async (props: Wish) => {
  // database
  const res = await prisma.wish.create({
    data: props,
  });
  return res;
};
// update
const updateFormDB = async (
  id: string,
  payload: Partial<Wish>
): Promise<Wish> => {
  const res = await prisma.wish.update({
    where: { id },
    data: payload,
  });
  return res;
};
//  delete
const deleteFormDB = async (id: string): Promise<Wish> => {
  const res = await prisma.wish.delete({
    where: { id },
  });
  return res;
};
//  getall
const getAllFormDB = async (
  filters: IWishesFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Wish[]>> => {
  const { limit, skip, page } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;
  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: WishesSearchAbleFields.map(field => ({
        [field]: {
          contains: searchTerm,
          // mode: 'insensitive', mySQL is  case insensitive by default
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map(key => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.WishWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const res = await prisma.wish.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [options.sortBy ?? 'created_at']: options.sortOrder ?? 'desc',
    },
    include: {
      user: {
        select: {
          id: true,
          full_name: true,
          mobile: true,
        },
      },
    },
  });

  //  get total
  const total = await prisma?.wish.count({
    where: whereConditions,
  });

  return {
    meta: {
      limit,
      page,
      total,
    },
    data: res,
  };
};
//  getById
const getByIdFormDB = async (id: string): Promise<Partial<Wish> | null> => {
  const res = await prisma.wish.findUnique({
    where: {
      id,
    },
  });
  return res;
};

//  export
export const WishesService = {
  insertIntoDB,
  getAllFormDB,
  getByIdFormDB,
  updateFormDB,
  deleteFormDB,
};
