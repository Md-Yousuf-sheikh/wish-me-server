import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { WishesController } from './wishes.controller';
import { WishesValidation } from './wishes.validation';

const router = express.Router();

router.post(
  '/create-wish',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.CUSTOMER),
  validateRequest(WishesValidation.create),
  WishesController.insertIntoDB
);
router.post(
  '/update-wish/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.CUSTOMER),
  validateRequest(WishesValidation.update),
  WishesController.updateFormDB
);
router.delete(
  '/delete-wish/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  WishesController.deleteFormDB
);
router.get(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.CUSTOMER),
  WishesController.getByIdFormDB
);
router.get(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.CUSTOMER),
  WishesController.getAllFormDB
);

export const WishesRoutes = router;
