import { decrypt, encrypt } from "../../Utils/encryption/encryption.utils.js";
import { successResponse } from "../../Utils/successResponse.utils.js";
import * as dbService from "../../DB/dbService.js";
import { roles, UserModel } from "../../DB/Models/user.model.js";
import { compare, hash } from "../../Utils/hashing/hash.utils.js";
import { logoutEnums } from "../../Utils/token/token.utils.js";
import { TokenModel } from "../../DB/Models/token.model.js";
import { cloudinaryConfig } from "../../Utils/multer/cloudinary.js";

export const getSingleUser = async (req, res, next) => {
  req.user.phone = decrypt(req.user.phone);

  const user = await dbService.findById({
    model: UserModel,
    id: req.user._id,
    populate: [{ path: "messages" }],
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "User fetched successfully",
    data: { user },
  });
};

export const shareProfile = async (req, res, next) => {
  const { userId } = req.params;

  const user = await dbService.findOne({
    model: UserModel,
    filter: {
      _id: userId,
      confirmEmail: { $exists: true },
    },
  });

  return user
    ? successResponse({
        res,
        statusCode: 200,
        message: "User fetched successfully",
        data: { user },
      })
    : next(new Error("Invalid or not verified email", { cause: 404 }));
};

export const updateProfile = async (req, res, next) => {
  if (req.body.phone) {
    req.body.phone = await encrypt(req.body.phone);
  }

  const updatedUser = await dbService.findOneAndUpdate({
    model: UserModel,
    filters: { _id: req.user._id },
    data: req.body,
  });

  return updatedUser
    ? successResponse({
        res,
        statusCode: 200,
        message: "Profile Update Successfully",
        data: { updatedUser },
      })
    : next(new Error("Invalid Account", { cause: 404 }));
};

export const freezeAccount = async (req, res, next) => {
  const { userId } = req.params;

  if (userId && req.user.role !== roles.admin)
    return next(
      new Error("You are not authorized to freeze this account", { cause: 403 })
    );

  const updatedUser = await dbService.findOneAndUpdate({
    model: UserModel,
    filters: { _id: userId || req.user._id, deletedAt: { $exists: false } },
    data: {
      deletedAt: Date.now(),
      deletedBy: req.user._id,
      $unset: {
        restoredAt: true,
        restoredBy: true,
      },
    },
  });

  return updatedUser
    ? successResponse({
        res,
        statusCode: 200,
        message: "Account frozen successfully",
        data: { updatedUser },
      })
    : next(new Error("Invalid Account", { cause: 404 }));
};

export const restoreAccount = async (req, res, next) => {
  const { userId } = req.params;

  const updatedUser = await dbService.findOneAndUpdate({
    model: UserModel,
    filters: {
      _id: userId,
      deletedAt: { $exists: true },
      deletedBy: { $ne: userId },
    },
    data: {
      $unset: {
        deletedAt: true,
        deletedBy: true,
      },
      restoredAt: Date.now(),
      restoredBy: req.user._id,
    },
  });

  return updatedUser
    ? successResponse({
        res,
        statusCode: 200,
        message: "Account Restored successfully",
        data: { updatedUser },
      })
    : next(new Error("Invalid Account", { cause: 404 }));
};

export const hardDelete = async (req, res, next) => {
  const { userId } = req.params;
  const user = await dbService.deleteOne({
    model: UserModel,
    filters: {
      _id: userId,
      deletedAt: { $exists: true },
    },
  });

  return user.deletedCount
    ? successResponse({
        res,
        statusCode: 200,
        message: "Account Deleted successfully",
      })
    : next(new Error("Invalid Account", { cause: 404 }));
};

export const updatePassword = async (req, res, next) => {
  const { oldPassword, password, flag } = req.body;

  if (!(await compare({ plainText: oldPassword, hash: req.user.password })))
    return next(new Error("OldPassword is incorrect", { cause: 400 }));

  let updatedData = {};
  switch (flag) {
    case logoutEnums.logoutFromAllDevices:
      updatedData.changeCredentialsTime = Date.now();
      break;
    case logoutEnums.logout:
      await dbService.create({
        model: TokenModel,
        data: [
          {
            jti: req.decoded.jti,
            userId: req.user._id,
            expiresIn: Date.now() - req.decoded.iat,
          },
        ],
      });
      break;
    default:
      break;
  }

  const updatedUser = await dbService.findOneAndUpdate({
    model: UserModel,
    filters: {
      _id: req.user._id,
    },
    data: {
      password: await hash({ plainText: password }),
      ...updatedData,
    },
  });

  return updatedUser
    ? successResponse({
        res,
        statusCode: 200,
        message: "Password Updated successfully",
        data: { updatedUser },
      })
    : next(new Error("Invalid Account", { cause: 404 }));
};

export const ProfileImage = async (req, res, next) => {
  const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
    req.file.path,
    {
      folder: `Sara7a-App/Users/${req.user._id}`,
    }
  );

  const user = await dbService.findOneAndUpdate({
    model: UserModel,
    filters: { _id: req.user._id },
    data: {
      profileCloudImage: { secure_url, public_id },
    },
  });

  if (req.user.profileCloudImage?.public_id) {
    await cloudinaryConfig().uploader.destroy(
      req.user.profileCloudImage.public_id
    );
  }

  return successResponse({
    res,
    statusCode: 200,
    message: "Profile Image Updated successfully",
    data: { user },
  });
};

export const coverImages = async (req, res, next) => {
  const attachments = [];
  for (const file of req.files) {
    const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
      file.path,
      {
        folder: `Sara7a-App/Users/${req.user._id}`,
      }
    );
    attachments.push({ secure_url, public_id });
  }

  const user = await dbService.findOneAndUpdate({
    model: UserModel,
    filters: { _id: req.user._id },
    data: {
      coverCloudImages: attachments,
    },
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "Cover Images Updated successfully",
    data: { user },
  });
};
