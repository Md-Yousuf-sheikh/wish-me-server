import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
const router = express.Router();

router.post(
  '/profile-update/:id',
  auth(ENUM_USER_ROLE.CUSTOMER),
  validateRequest(UserValidation.updateUser),
  UserController.updateUser
);

export const UserRoutes = router;
