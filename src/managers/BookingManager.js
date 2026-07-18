import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getServiceById } from './ServiceManager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, '..', 'data', 'bookings.json');

const readBookings = async () => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeBookings = async (bookings) => {
  await fs.writeFile(filePath, JSON.stringify(bookings, null, 2));
};

export const createBooking = async (bookingData) => {
  const { clientName, clientEmail, date, time, status, services } = bookingData;

  if (!clientName || !clientEmail || !date || !time) {
    return { status: 'error', message: 'Faltan campos obligatorios' };
  }

  const bookings = await readBookings();

  const newBooking = {
    id: bookings.length > 0 ? bookings[bookings.length - 1].id + 1 : 1,
    clientName,
    clientEmail,
    date,
    time,
    status: status ?? 'pending',
    services: services ?? [],
  };

  bookings.push(newBooking);
  await writeBookings(bookings);

  return { status: 'success', payload: newBooking };
};

export const getBookingById = async (id) => {
  const bookings = await readBookings();
  const booking = bookings.find((booking) => booking.id === Number(id));
  return booking ?? null;
};

export const addServiceToBooking = async (bid, sid) => {
  const bookings = await readBookings();
  const bookingIndex = bookings.findIndex((booking) => booking.id === Number(bid));

  if (bookingIndex === -1) {
    return { status: 'error', message: 'Reserva no encontrada' };
  }

  const service = await getServiceById(sid);

  if (!service) {
    return { status: 'error', message: 'Servicio no encontrado' };
  }

  const booking = bookings[bookingIndex];
  const existingEntry = booking.services.find((s) => s.service === Number(sid));

  if (existingEntry) {
    existingEntry.quantity += 1;
  } else {
    booking.services.push({ service: Number(sid), quantity: 1 });
  }

  await writeBookings(bookings);

  return { status: 'success', payload: booking };
};
