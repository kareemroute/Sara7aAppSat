export const findOne = async ({
  model,
  filter = {},
  select = "",
  populate = [],
} = {}) => {
  return await model.findOne(filter).select(select).populate(populate);
};

export const find = async ({
  model,
  filter = {},
  select = "",
  populate = [],
} = {}) => {
  return await model.find(filter).select(select).populate(populate);
};

export const findById = async ({
  model,
  id = "",
  select = "",
  populate = [],
} = {}) => {
  return await model.findById(id).select(select).populate(populate);
};

export const create = async ({
  model,
  data = [{}],
  options = { validateBeforeSave: true },
}) => {
  return await model.create(data, options);
};

export const updateOne = async ({
  model,
  filters = {},
  data = {},
  options = { runValidators: true },
}) => {
  return await model.updateOne(filters, data, options);
};

export const deleteOne = async ({ model, filters = {} }) => {
  return await model.deleteOne(filters);
};

export const findOneAndUpdate = async ({
  model,
  filters = {},
  data = {},
  options = { runValidators: true, new: true },
  select = "",
  populate = [],
}) => {
  return await model
    .findOneAndUpdate(filters, { ...data, $inc: { __v: 1 } }, options)
    .select(select)
    .populate(populate);
};
