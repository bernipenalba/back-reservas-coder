import mongoose from 'mongoose';
import { ServiceModel } from './models/service.model.js';

export const getAll = async (filter = {}, options = {}) => {
  const { sort, skip, limit } = options;

  let query = ServiceModel.find(filter);

  if (sort) {
    query = query.sort(sort);
  }

  if (skip !== undefined) {
    query = query.skip(skip);
  }

  if (limit !== undefined) {
    query = query.limit(limit);
  }

  return await query;
};

export const count = async (filter = {}) => {
  return await ServiceModel.countDocuments(filter);
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

  return await ServiceModel.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after' });
};

export const remove = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  return await ServiceModel.findByIdAndDelete(id);
};
