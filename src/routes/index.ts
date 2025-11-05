import { Router } from "express";
import { authRouter } from "./auth/auth.route";

type TRoutes = {
  path: string;
  route: Router;
};

const router = Router();

const routes: TRoutes[] = [
  {
    path: "/auth",
    route: authRouter,
  },
];

routes.forEach((route) => router.use(route.path, route.route));

export default router;
