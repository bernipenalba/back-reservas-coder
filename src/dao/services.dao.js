import mongoose from 'mongoose';
import { ServiceModel } from './models/service.model.js';

export const getAll = async () => {
  return await ServiceModel.find();
};

export const getById = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  return await ServiceModel.findById(id);
};

export const create = async (data) => {
  return await ServiceModel.create(data);
};

export const update = async (id, data) => {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  return await ServiceModel.findByIdAndUpdate(id, { $set: data }, { new: true });
};

export const remove = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  return await ServiceModel.findByIdAndDelete(id);
};
