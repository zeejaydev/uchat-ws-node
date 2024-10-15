import { Router } from "express";
import { login, registerForPush, signUp } from "../controllers/auth";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/signUp", signUp);
authRouter.post("/pushRegister", registerForPush);
export default authRouter;
