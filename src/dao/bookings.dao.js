import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

export const create = async (data) => {
  const bookings = await readBookings();

  const newBooking = {
    id: bookings.length > 0 ? bookings[bookings.length - 1].id + 1 : 1,
    ...data,
  };

  bookings.push(newBooking);
  await writeBookings(bookings);

  return newBooking;
};

export const getById = async (id) => {
  const bookings = await readBookings();
  const booking = bookings.find((booking) => booking.id === Number(id));
  return booking ?? null;
};

export const update = async (id, data) => {
  const bookings = await readBookings();
  const index = bookings.findIndex((booking) => booking.id === Number(id));

  if (index === -1) {
    return null;
  }

  const updatedBooking = {
    ...bookings[index],
    ...data,
    id: bookings[index].id,
  };

  bookings[index] = updatedBooking;
  await writeBookings(bookings);

  return updatedBooking;
};