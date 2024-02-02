import { User } from '@prisma/client';
import prisma from '../../../shared/prisma';

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
export const UserService = {
  updateUser,
};
