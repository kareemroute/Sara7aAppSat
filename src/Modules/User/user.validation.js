import joi from "joi";
import { generalFields } from "../../Middlewares/validation.middlewre.js";
import { logoutEnums } from "../../Utils/token/token.utils.js";
import { fileValidation } from "../../Utils/multer/local.multer.js";

export const shareProfileValidation = {
  params: joi.object({
    userId: generalFields.id.required(),
  }),
};

export const updateBasicDataValidation = {
  body: joi.object({
    firstName: generalFields.firstName,
    lastName: generalFields.lastName,
    gender: generalFields.gender,
    phone: generalFields.phone,
  }),
};

export const freezeAccountValidation = {
  params: joi.object({
    userId: generalFields.id,
  }),
};

export const restoreAccountValidation = {
  params: joi.object({
    userId: generalFields.id.required(),
  }),
};

export const hardDeleteAccountValidation = {
  params: joi.object({
    userId: generalFields.id.required(),
  }),
};

export const updatePasswordValidation = {
  body: joi.object({
    flag: joi
      .string()
      .valid(...Object.values(logoutEnums))
      .default(logoutEnums.stayLoggedIn),
    oldPassword: generalFields.password.required(),
    password: generalFields.password.not(joi.ref("oldPassword")).required(),
    confirmPassword: generalFields.confirmPassword,
  }),
};

export const profileImageValidation = {
  file: joi
    .object({
      fieldname: generalFields.file.fieldname.valid("image").required(),
      originalname: generalFields.file.originalname.required(),
      encoding: generalFields.file.encoding.required(),
      mimetype: generalFields.file.mimetype
        .valid(...fileValidation.images)
        .required(),
      size: generalFields.file.size.max(5 * 1024 * 1024).required(),
      path: generalFields.file.path.required(),
      filename: generalFields.file.filename.required(),
      finalPath: generalFields.file.finalPath.required(),
      destination: generalFields.file.destination.required(),
    })
    .required(),
};

export const coverImagesValidation = {
  files: joi
    .array()
    .items(
      joi
        .object({
          fieldname: generalFields.file.fieldname.valid("images").required(),
          originalname: generalFields.file.originalname.required(),
          encoding: generalFields.file.encoding.required(),
          mimetype: generalFields.file.mimetype
            .valid(...fileValidation.images)
            .required(),
          size: generalFields.file.size.max(5 * 1024 * 1024).required(),
          path: generalFields.file.path.required(),
          filename: generalFields.file.filename.required(),
          finalPath: generalFields.file.finalPath.required(),
          destination: generalFields.file.destination.required(),
        })
        .required()
    )
    .required(),
};
