import { z } from 'zod';


const create = z.object({
  body: z.object({
    receiver_name: z.string({
      required_error: 'Receiver name is required',
    }),
    mobile: z.string({
      required_error: 'Mobile number is required',
    }),
    message: z.string({
      required_error: 'Message is required',
    }),
    wish_type: z.string({
      required_error: 'Wish type is required',
    }),
    schedule_date: z.string({
      required_error: 'Schedule date is required',
    }),
  }),
});

const update = z.object({
  body: z.object({
    receiver_name: z.string().optional(),
    mobile:z.string().optional(),
    message: z.string().optional(),
    wish_type:z.string().optional(),
    schedule_date:z.string().optional(),
  }),
});


export const WishesValidation = {
  create,
  update
};
