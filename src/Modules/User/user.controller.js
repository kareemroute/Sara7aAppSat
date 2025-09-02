import { Router } from "express";
import * as userService from "./user.service.js";
import {
  authentication,
  authorization,
  tokenTypeEnum,
} from "../../Middlewares/authentication.middleware.js";
import { endPoints } from "./user.authorization.js";
import { validation } from "../../Middlewares/validation.middlewre.js";
import {
  coverImagesValidation,
  freezeAccountValidation,
  hardDeleteAccountValidation,
  profileImageValidation,
  restoreAccountValidation,
  shareProfileValidation,
  updateBasicDataValidation,
  updatePasswordValidation,
} from "./user.validation.js";
import {
  fileValidation,
  localFileUpload,
} from "../../Utils/multer/local.multer.js";
import { cloudFileUpload } from "../../Utils/multer/cloud.multer.js";
const router = Router({
  caseSensitive: true,
  strict: true,
});

router.get(
  "/getProfile",
  authentication({ tokenType: tokenTypeEnum.access }),
  authorization({ accessRoles: endPoints.getProfile }),
  userService.getSingleUser
);

router.get(
  "/share-profile/:userId",
  validation(shareProfileValidation),
  userService.shareProfile
);

router.patch(
  "/update-profile",
  validation(updateBasicDataValidation),
  authentication({ tokenType: tokenTypeEnum.access }),
  authorization({ accessRoles: endPoints.updateBasicData }),
  userService.updateProfile
);

router.delete(
  "{/:userId}/freeze-account",
  validation(freezeAccountValidation),
  authentication({ tokenType: tokenTypeEnum.access }),
  authorization({ accessRoles: endPoints.freezeAccount }),
  userService.freezeAccount
);

router.patch(
  "/:userId/restore-account",
  validation(restoreAccountValidation),
  authentication({ tokenType: tokenTypeEnum.access }),
  authorization({ accessRoles: endPoints.restoreAccount }),
  userService.restoreAccount
);

router.delete(
  "/:userId/hard-delete",
  validation(hardDeleteAccountValidation),
  authentication({ tokenType: tokenTypeEnum.access }),
  authorization({ accessRoles: endPoints.hardDelete }),
  userService.hardDelete
);

router.patch(
  "/update-password",
  validation(updatePasswordValidation),
  authentication({ tokenType: tokenTypeEnum.access }),
  authorization({ accessRoles: endPoints.updatePassword }),
  userService.updatePassword
);

router.patch(
  "/profile-image",
  authentication({ tokenType: tokenTypeEnum.access }),
  // localFileUpload({
  //   customPath: "User",
  //   validation: [...fileValidation.images],
  // }).single("image"),
  // validation(profileImageValidation),
  cloudFileUpload({ validation: [...fileValidation.images] }).single("image"),
  userService.ProfileImage
);

router.patch(
  "/cover-images",
  authentication({ tokenType: tokenTypeEnum.access }),
  // localFileUpload({
  //   customPath: "User",
  //   validation: [...fileValidation.images],
  // }).array("images", 5),
  // validation(coverImagesValidation),
  cloudFileUpload({ validation: [...fileValidation.images] }).array(
    "images",
    5
  ),

  userService.coverImages
);

export default router;
