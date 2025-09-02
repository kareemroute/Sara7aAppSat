import { roles } from "../../DB/Models/user.model.js";

export const endPoints = {
  getProfile: [roles.admin, roles.user],
  updateBasicData: [roles.admin, roles.user],
  freezeAccount: [roles.admin, roles.user],
  restoreAccount: [roles.admin],
  hardDelete: [roles.admin],
  updatePassword: [roles.admin, roles.user],
};
