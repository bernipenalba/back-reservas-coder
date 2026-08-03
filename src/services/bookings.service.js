import * as bookingsRepository from '../repositories/bookings.repository.js';
import * as servicesRepository from '../repositories/services.repository.js';

export const createBooking = async (data) => {
  const { clientName, clientEmail, date, time, status, services } = data;

  if (!clientName || !clientEmail || !date || !time) {
    const error = new Error('Faltan campos obligatorios');
    error.statusCode = 400;
    throw error;
  }

  return await bookingsRepository.create({
    clientName,
    clientEmail,
    date,
    time,
    status: status ?? 'pending',
    services: services ?? [],
  });
};

export const getBookingById = async (id) => {
  const booking = await bookingsRepository.getById(id);

  if (!booking) {
    const error = new Error('Reserva no encontrada');
    error.statusCode = 404;
    throw error;
  }

  return booking;
};

export const addServiceToBooking = async (bid, sid) => {
  const booking = await bookingsRepository.getById(bid);

  if (!booking) {
    const error = new Error('Reserva no encontrada');
    error.statusCode = 404;
    throw error;
  }

  const service = await servicesRepository.getById(sid);

  if (!service) {
    const error = new Error('Servicio no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const existingEntry = booking.services.find((s) => s.service === Number(sid));

  if (existingEntry) {
    existingEntry.quantity += 1;
  } else {
    booking.services.push({ service: Number(sid), quantity: 1 });
  }

  await bookingsRepository.update(bid, { services: booking.services });

  return booking;
};
