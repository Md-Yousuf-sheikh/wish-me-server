import { z } from 'zod';

const updateUser = z.object({
  body: z.object({
    full_name: z.string().optional(),
    profile_image: z.string().optional(),
    work_status: z.string().optional(),
  }),
});

export const UserValidation = {
  updateUser
};
