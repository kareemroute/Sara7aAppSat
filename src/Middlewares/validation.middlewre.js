import joi from "joi";
import { Types } from "mongoose";

export const generalFields = {
  firstName: joi.string().min(3).max(20).messages({
    "string.min": "First name must be at least 3 characters long",
    "string.max": "First name must be at most 20 characters long",
    "any.required": "First name is Mandatory",
  }),
  lastName: joi.string().min(3).max(20).messages({
    "string.min": "Last name must be at least 3 characters long",
    "string.max": "Last name must be at most 20 characters long",
    "any.required": "Last name is Mandatory",
  }),
  email: joi.string().email({
    minDomainSegments: 2,
    maxDomainSegments: 5,
    tlds: { allow: ["com", "net", "edu", "io", "gov", "org"] },
  }),
  password: joi.string().pattern(/^[A-Za-z\d@#$!?&*]{8,20}$/),
  confirmPassword: joi.ref("password"),
  gender: joi.string().valid("male", "female").default("male"),
  role: joi.string().valid("USER", "ADMIN").default("USER"),
  phone: joi.string().pattern(/^(002|\+2)?01[0125]\d{8}$/),
  otp: joi.string().pattern(/^\d{6}$/),
  id: joi.string().custom((value, helper) => {
    return (
      Types.ObjectId.isValid(value) || helper.message("Invalid ObjectId Format")
    );
  }),
  file: {
    fieldname: joi.string(),
    originalname: joi.string(),
    encoding: joi.string(),
    mimetype: joi.string(),
    size: joi.number().positive(),
    path: joi.string(),
    filename: joi.string(),
    finalPath: joi.string(),
    destination: joi.string(),
  },
};

export const validation = (schema) => {
  return (req, res, next) => {
    const validationError = [];
    for (const key of Object.keys(schema)) {
      const validationResults = schema[key].validate(req[key], {
        abortEarly: false,
      });

      if (validationResults.error)
        validationError.push({ key, details: validationResults.error.details });
    }

    if (validationError.length)
      return res
        .status(400)
        .json({ error: "Validation Error", details: validationError });

    return next();
  };
};
