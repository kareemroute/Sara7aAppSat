import { Router } from "express";
import * as authService from "./auth.service.js";
import {
  authentication,
  tokenTypeEnum,
} from "../../Middlewares/authentication.middleware.js";
import { validation } from "../../Middlewares/validation.middlewre.js";
import {
  confirmEmailValidation,
  forgetPasswordVaidation,
  loginValidation,
  logoutValidation,
  resetPasswordVaidation,
  signUpValidation,
  socialLoginWithGmailValidation,
} from "./auth.validation.js";
const router = Router();

router.post("/signup", validation(signUpValidation), authService.signUp);

router.post("/login", validation(loginValidation), authService.login);

router.post(
  "/logout",
  validation(logoutValidation),
  authentication({ tokenType: tokenTypeEnum.access }),
  authService.logout
);

router.post(
  "/social-login",
  validation(socialLoginWithGmailValidation),
  authService.loginWithGmail
);

router.get(
  "/refresh-token",
  authentication({ tokenType: tokenTypeEnum.refresh }),
  authService.refreshToken
);

router.patch(
  "/confirm-email",
  validation(confirmEmailValidation),
  authService.confirmEmail
);

router.patch(
  "/forget-password",
  validation(forgetPasswordVaidation),
  authService.forgetPassword
);

router.patch(
  "/reset-password",
  validation(resetPasswordVaidation),
  authService.resetPassword
);

export default router;
