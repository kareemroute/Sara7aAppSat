import { UserModel } from "../DB/Models/user.model.js";
import { getSingature, verifyToken } from "../Utils/token/token.utils.js";
import * as dbService from "../DB/dbService.js";
import { TokenModel } from "../DB/Models/token.model.js";

export const tokenTypeEnum = {
  access: "access",
  refresh: "refresh",
};

const decodedToken = async ({
  authorization,
  tokenType = tokenTypeEnum.access,
  next,
}) => {
  const [bearer, token] = authorization.split(" ") || [];

  if (!bearer || !token)
    return next(new Error("Invalid Token", { cause: 400 }));

  let signature = await getSingature({
    signatureLevel: bearer,
  });

  const decoded = verifyToken({
    token,
    signature:
      tokenType === tokenTypeEnum.access
        ? signature.accessSignature
        : signature.refreshSignature,
  });

  if (
    decoded.jti &&
    (await dbService.findOne({
      model: TokenModel,
      filter: {
        jti: decoded.jti,
      },
    }))
  )
    return next(new Error("Token Is Revoked", { cause: 401 }));

  const user = await dbService.findById({
    model: UserModel,
    id: { _id: decoded._id },
  });
  if (!user) return next(new Error("User Not Found", { cause: 404 }));

  if (user.changeCredentialsTime?.getTime() > decoded.iat * 1000)
    return next(new Error("Token is Expried", { cause: 401 }));

  return { user, decoded };
};

export const authentication = ({ tokenType = tokenTypeEnum.access }) => {
  return async (req, res, next) => {
    const { user, decoded } =
      (await decodedToken({
        authorization: req.headers.authorization,
        tokenType,
        next,
      })) || {};
    req.user = user;
    req.decoded = decoded;
    return next();
  };
};

export const authorization = ({ accessRoles = [] }) => {
  return async (req, res, next) => {
    if (!accessRoles.includes(req.user.role))
      return next(new Error("Unauthorized", { cause: 403 }));

    return next();
  };
};
