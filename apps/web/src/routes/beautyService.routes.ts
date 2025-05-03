import { Router } from 'express';

import { ServiceService } from '../services/beauty-service?.service';

import { validateRequest } from '../middleware/validate-request';

import { createServiceSchema } from '../schemas/service?.schema';

import { isAuthenticated } from '../middleware/auth';

const router = Router();
const serviceService = new ServiceService();

router?.post('/', isAuthenticated, validateRequest(createServiceSchema), async (req, res) => {
  try {
    const service = await serviceService?.createService(req?.body);
    res?.json(service);
  } catch (error) {
    res?.status(500).json({ error: 'Failed to create service' });
  }
});

router?.get('/:id', async (req, res) => {
  try {
    const service = await serviceService?.getServiceById(req?.params.id);
    if (!service) {
      return res?.status(404).json({ error: 'Service not found' });
    }
    res?.json(service);
  } catch (error) {
    res?.status(500).json({ error: 'Failed to get service' });
  }
});

router?.get('/business/:businessId', async (req, res) => {
  try {
    const services = await serviceService?.getServicesByBusiness(req?.params.businessId);
    res?.json(services);
  } catch (error) {
    res?.status(500).json({ error: 'Failed to get services' });
  }
});

router?.put('/:id', isAuthenticated, validateRequest(createServiceSchema), async (req, res) => {
  try {
    const service = await serviceService?.updateService(req?.params.id, req?.body);
    res?.json(service);
  } catch (error) {
    res?.status(500).json({ error: 'Failed to update service' });
  }
});

router?.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    await serviceService?.deleteService(req?.params.id);
    res?.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res?.status(500).json({ error: 'Failed to delete service' });
  }
});

export default router; 