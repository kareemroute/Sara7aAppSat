import * as dbService from "../../DB/dbService.js";
import { providers, UserModel } from "../../DB/Models/user.model.js";
import { encrypt } from "../../Utils/encryption/encryption.utils.js";
import { emailEvent } from "../../Utils/events/evnet.utils.js";
import { compare, hash } from "../../Utils/hashing/hash.utils.js";
import { successResponse } from "../../Utils/successResponse.utils.js";
import {
  getNewLoginCredentials,
  logoutEnums,
} from "../../Utils/token/token.utils.js";
import { OAuth2Client } from "google-auth-library";
import { customAlphabet } from "nanoid";
import { TokenModel } from "../../DB/Models/token.model.js";

export const signUp = async (req, res, next) => {
  const { firstName, lastName, email, password, gender, phone, role } =
    req.body;

  if (await dbService.findOne({ model: UserModel, filter: { email } }))
    return next(new Error("User already exists", { cause: 409 }));

  const hashedPassword = await hash({ plainText: password });
  const encryptedPhone = encrypt(phone);
  const code = customAlphabet("0123456789", 6)();
  const hashOTP = await hash({ plainText: code });

  emailEvent.emit("confirmEmail", { to: email, otp: code, firstName });

  const user = await dbService.create({
    model: UserModel,
    data: [
      {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        gender,
        phone: encryptedPhone,
        role,
        confirmEmailOTP: hashOTP,
      },
    ],
  });

  return successResponse({
    res,
    statusCode: 201,
    message: "User created successfully",
    data: user,
  });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await dbService.findOne({
    model: UserModel,
    filter: { email },
  });
  if (!user) return next(new Error("User Not Found", { cause: 404 }));

  if (!(await compare({ plainText: password, hash: user.password })))
    return next(new Error("Invalid credentials", { cause: 401 }));

  if (!user.confirmEmail)
    return next(
      new Error("User Not Found of Email Not Confirmed", { cause: 401 })
    );

  const newCredentials = await getNewLoginCredentials(user);

  return successResponse({
    res,
    statusCode: 200,
    message: "User logged in successfully",
    data: { newCredentials },
  });
};

export const logout = async (req, res, next) => {
  const { flag } = req.body;

  let status = 200;
  switch (flag) {
    case logoutEnums.logoutFromAllDevices:
      await dbService.updateOne({
        model: UserModel,
        filters: { _id: req.user._id },
        data: {
          changeCredentialsTime: Date.now(),
        },
      });
      break;
    default:
      await dbService.create({
        model: TokenModel,
        data: [
          {
            jti: req.decoded.jti,
            userId: req.user._id,
            expiresIn: Date.now() - req.decoded.exp,
          },
        ],
      });
      status = 201;
      break;
  }

  return successResponse({
    res,
    statusCode: status,
    message: "User logged out successfully",
  });
};

export const confirmEmail = async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await dbService.findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: false },
      confirmEmailOTP: { $exists: true },
    },
  });
  if (!user)
    return next(new Error("User Not Fount of Email Already Confirmed"));

  if (!(await compare({ plainText: otp, hash: user.confirmEmailOTP })))
    return next(new Error("Invalid OTP", { cause: 401 }));

  await dbService.updateOne({
    model: UserModel,
    filters: { email },
    data: {
      confirmEmail: Date.now(),
      $unset: { confirmEmailOTP: true },
      $inc: { __v: 1 },
    },
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "Email Confirmed Successfully",
  });
};

async function verifyGoogleAccount({ idToken }) {
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.CLIENT_ID,
  });
  const payload = ticket.getPayload();

  return payload;
}

export const loginWithGmail = async (req, res, next) => {
  const { idToken } = req.body;

  const { email, email_verified, picture, given_name, family_name } =
    await verifyGoogleAccount({ idToken });

  if (!email_verified)
    return next(new Error("Email not Verfied", { cause: 401 }));

  const user = await dbService.findOne({
    model: UserModel,
    filter: { email },
  });

  if (user) {
    if (user.provider === providers.google) {
      const newCredentials = await getNewLoginCredentials(user);

      return successResponse({
        res,
        statusCode: 200,
        message: "User logged in successfully",
        data: { newCredentials },
      });
    }
  }

  const newUser = await dbService.create({
    model: UserModel,
    data: [
      {
        email,
        firstName: given_name,
        lastName: family_name,
        photo: picture,
        provider: providers.google,
        confirmEmail: Date.now(),
      },
    ],
  });

  const newCredentials = await getNewLoginCredentials(user);

  return successResponse({
    res,
    statusCode: 201,
    message: "User created successfully",
    data: { newCredentials },
  });
};

export const refreshToken = async (req, res, next) => {
  const user = req.user;
  const newCredentials = await getNewLoginCredentials(user);

  return successResponse({
    res,
    statusCode: 200,
    message: "New Credentials Generated Successfully",
    data: { newCredentials },
  });
};

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  const otp = await customAlphabet("0123456789", 6)();
  const hashOTP = await hash({ plainText: otp });
  const user = await dbService.findOneAndUpdate({
    model: UserModel,
    filters: {
      email,
      provider: providers.system,
      confirmEmail: { $exists: true },
      deletedAt: { $exists: false },
    },
    data: {
      forgetPasswordOTP: hashOTP,
    },
  });

  if (!user)
    return next(
      new Error("User Not Found Or Email Not Confirmed", { cause: 404 })
    );

  emailEvent.emit("forgetpassword", {
    to: email,
    firstName: user.firstName,
    otp,
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "Check Your Inbox",
  });
};

export const resetPassword = async (req, res, next) => {
  const { email, otp, password } = req.body;

  const user = await dbService.findOne({
    model: UserModel,
    filters: {
      email,
      provider: providers.system,
      confirmEmail: { $exists: true },
      deletedAt: { $exists: false },
      forgetPasswordOTP: { $exists: true },
    },
  });

  if (!user) return next(new Error("Invalid Account", { cause: 404 }));

  if (!(await compare({ plainText: otp, hash: user.forgetPasswordOTP })))
    return next(new Error("Invalid OTP", { casue: 400 }));

  const hashedPassword = await hash({ plainText: password });

  await dbService.updateOne({
    model: UserModel,
    filters: { email },
    data: {
      password: hashedPassword,
      $unset: { forgetPasswordOTP: true },
      $inc: { __v: 1 },
    },
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "Password Reset Successfully",
  });
};
