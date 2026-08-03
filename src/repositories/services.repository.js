import * as servicesDao from '../dao/services.dao.js';

export const getAll = async () => {
  return await servicesDao.getAll();
};

export const getById = async (id) => {
  return await servicesDao.getById(id);
};

export const create = async (data) => {
  return await servicesDao.create(data);
};

export const update = async (id, data) => {
  return await servicesDao.update(id, data);
};

export const remove = async (id) => {
  return await servicesDao.remove(id);
};