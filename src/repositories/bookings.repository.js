import * as bookingsDao from '../dao/bookings.dao.js';

export const create = async (data) => {
  return await bookingsDao.create(data);
};

export const getById = async (id) => {
  return await bookingsDao.getById(id);
};

export const getByIdPopulated = async (id) => {
  return await bookingsDao.getByIdPopulated(id);
};

export const update = async (id, data) => {
  return await bookingsDao.update(id, data);
};
