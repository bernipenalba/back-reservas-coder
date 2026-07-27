import * as serviceManager from '../managers/ServiceManager.js';
 
export const getServices = async (req, res) => {
    try {
        const { category, available } = req.query;
        const services = await serviceManager.getServices({ category, available });
        res.status(200).json({ status: 'success', payload: services });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al obtener los servicios' });
    }
};
 
export const getServiceById = async (req, res) => {
    try {
        const { sid } = req.params;
        const service = await serviceManager.getServiceById(sid);
 
        if (!service) {
            return res.status(404).json({ status: 'error', message: 'Servicio no encontrado' });
        }
 
        res.status(200).json({ status: 'success', payload: service });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al buscar el servicio' });
    }
};
 
export const createService = async (req, res) => {
    try {
        const result = await serviceManager.addService(req.body);
        const statusCode = result.status === 'error' ? 400 : 201;
        res.status(statusCode).json(result);
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al crear el servicio' });
    }
};
 
export const updateService = async (req, res) => {
    try {
        const { sid } = req.params;
        const result = await serviceManager.updateService(sid, req.body);
        const statusCode = result.status === 'error' ? 404 : 200;
        res.status(statusCode).json(result);
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al actualizar el servicio' });
    }
};
 
export const deleteService = async (req, res) => {
    try {
        const { sid } = req.params;
        const result = await serviceManager.deleteService(sid);
        const statusCode = result.status === 'error' ? 404 : 200;
        res.status(statusCode).json(result);
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al eliminar el servicio' });
    }
};
