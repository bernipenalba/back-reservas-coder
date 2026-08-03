import * as bookingsService from '../services/bookings.service.js';

export const createBooking = async (req, res) => {
  try {
    const newBooking = await bookingsService.createBooking(req.body);
    res.status(201).json({ status: 'success', payload: newBooking });
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ status: 'error', message: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { bid } = req.params;
    const booking = await bookingsService.getBookingById(bid);
    res.status(200).json({ status: 'success', payload: booking });
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ status: 'error', message: error.message });
  }
};

export const addServiceToBooking = async (req, res) => {
  try {
    const { bid, sid } = req.params;
    const booking = await bookingsService.addServiceToBooking(bid, sid);
    res.status(200).json({ status: 'success', payload: booking });
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ status: 'error', message: error.message });
  }
};
