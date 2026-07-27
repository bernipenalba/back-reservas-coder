import * as bookingManager from '../managers/BookingManager.js';
 
export const createBooking = async (req, res) => {
    try {
        const result = await bookingManager.createBooking(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al crear la reserva' });
    }
};
 
export const getBookingById = async (req, res) => {
    try {
        const { bid } = req.params;
        const booking = await bookingManager.getBookingById(bid);
 
        if (!booking) {
            return res.status(404).json({ status: 'error', message: 'Reserva no encontrada' });
        }
 
        res.status(200).json({ status: 'success', payload: booking });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al buscar la reserva' });
    }
};
 
export const addServiceToBooking = async (req, res) => {
    try {
        const { bid, sid } = req.params;
        const result = await bookingManager.addServiceToBooking(bid, sid);
        const statusCode = result.status === 'error' ? 404 : 200;
        res.status(statusCode).json(result);
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al agregar el servicio a la reserva' });
    }
};
