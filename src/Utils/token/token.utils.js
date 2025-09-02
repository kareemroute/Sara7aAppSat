import jwt from "jsonwebtoken";
import { roles } from "../../DB/Models/user.model.js";
import { nanoid } from "nanoid";

export const signatureEnum = {
  admin: "Admin",
  user: "User",
};

export const logoutEnums = {
  logoutFromAllDevices: "logoutFromAllDevices",
  logout: "logout",
  stayLoggedIn: "stayLoggedIn",
};

export const signToken = ({
  payload = {},
  signature,
  options = {
    expiresIn: "1d",
  },
}) => {
  return jwt.sign(payload, signature, options);
};

export const verifyToken = ({ token = "", signature }) => {
  return jwt.verify(token, signature);
};

export const getSingature = async ({ signatureLevel = signatureEnum.user }) => {
  let signature = { accessSignature: undefined, refreshSignature: undefined };

  switch (signatureLevel) {
    case signatureEnum.admin:
      signature.accessSignature = process.env.ACCESS_ADMIN_SIGNATURE_TOKEN;
      signature.refreshSignature = process.env.REFRESH_ADMIN_SIGNATURE_TOKEN;
      break;
    case signatureEnum.user:
      signature.accessSignature = process.env.ACCESS_USER_SIGNATURE_TOKEN;
      signature.refreshSignature = process.env.REFRESH_USER_SIGNATURE_TOKEN;
      break;
    default:
      break;
  }

  return signature;
};

export const getNewLoginCredentials = async (user) => {
  let signature = await getSingature({
    signatureLevel:
      user.role != roles.user ? signatureEnum.admin : signatureEnum.user,
  });

  const jwtid = nanoid();

  const accessToken = signToken({
    payload: { _id: user._id },
    signature: signature.accessSignature,
    options: {
      expiresIn: "1d",
      issuer: "Sara7a App",
      subject: "Authentication",
      jwtid,
    },
  });

  const refreshToken = signToken({
    payload: { _id: user._id },
    signature: signature.refreshSignature,
    options: {
      expiresIn: "7d",
      issuer: "Sara7a App",
      subject: "Authentication",
      jwtid,
    },
  });

  return { accessToken, refreshToken };
};
