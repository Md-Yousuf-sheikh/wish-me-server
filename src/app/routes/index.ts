import express from 'express';
import { AuthRoutes } from '../modules/Auth/auth.routes';
import { UserRoutes } from '../modules/User/user.routes';
import { WishesRoutes } from '../modules/Wishes/wishes.routes';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/wishes',
    route: WishesRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
