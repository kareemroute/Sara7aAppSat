import { Router } from "express";
import * as messageService from "./message.service.js";
import { cloudFileUpload } from "../../Utils/multer/cloud.multer.js";
import { fileValidation } from "../../Utils/multer/local.multer.js";
import { validation } from "../../Middlewares/validation.middlewre.js";
import {
  getMessageValidation,
  sendMessageValidation,
} from "./message.validation.js";
import {
  authentication,
  tokenTypeEnum,
} from "../../Middlewares/authentication.middleware.js";
const router = Router();

router.post(
  "/:recieverId/send-message",
  cloudFileUpload({ validation: [...fileValidation.images] }).array(
    "attachments",
    3
  ),
  validation(sendMessageValidation),
  messageService.sendMessages
);

router.post(
  "/:recieverId/sender",
  authentication({ tokenType: tokenTypeEnum.access }),
  cloudFileUpload({ validation: [...fileValidation.images] }).array(
    "attachments",
    3
  ),
  validation(sendMessageValidation),
  messageService.sendMessages
);

router.get(
  "/:userId/get-messages",
  validation(getMessageValidation),
  messageService.getMessages
);
export default router;
