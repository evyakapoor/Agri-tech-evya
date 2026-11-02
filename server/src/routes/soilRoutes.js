import { Router } from 'express';
import { getSoilReports, getSoilReportById, createSoilReport, deleteSoilReport } from '../controllers/soilController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { soilReportRules, mongoIdParamRule } from '../validators/entityValidators.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getSoilReports)
  .post(soilReportRules, validate, createSoilReport);

router.route('/:id')
  .get(mongoIdParamRule('id'), validate, getSoilReportById)
  .delete(mongoIdParamRule('id'), validate, deleteSoilReport);

export default router;
