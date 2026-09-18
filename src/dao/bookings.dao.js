import mongoose from 'mongoose';
import { BookingModel } from './models/booking.model.js';

export const create = async (data) => {
  return await BookingModel.create(data);
};

export const getById = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  return await BookingModel.findById(id);
};

export const update = async (id, data) => {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  return await BookingModel.findByIdAndUpdate(id, { $set: data }, { new: true });
};
