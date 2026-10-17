import { Request, Response, NextFunction } from 'express';
import { getVehiclesList, getVehicleById } from '../services/vehicleService';

export async function listVehicles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vehicles = await getVehiclesList();
    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length
    });
  } catch (err) {
    next(err);
  }
}

export async function getVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const vehicle = await getVehicleById(id);
    if (!vehicle) {
      res.status(404).json({
        error: {
          code: 'VEHICLE_NOT_FOUND',
          message: `Vehicle with ID '${id}' was not found.`,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }
    res.json({
      success: true,
      data: vehicle
    });
  } catch (err) {
    next(err);
  }
}
