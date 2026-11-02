import { body, param } from 'express-validator';

export const farmRules = [
  body('farmName')
    .trim()
    .notEmpty()
    .withMessage('Farm name is required.')
    .isLength({ max: 120 })
    .withMessage('Farm name cannot exceed 120 characters.'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Farm location/address is required.'),
  body('totalArea')
    .isFloat({ min: 0.01 })
    .withMessage('Total area must be a positive number greater than 0.'),
  body('areaUnit')
    .optional()
    .isIn(['acres', 'hectares', 'bigha'])
    .withMessage('Area unit must be acres, hectares, or bigha.'),
  body('soilType')
    .optional()
    .isIn(['Alluvial', 'Black', 'Red', 'Laterite', 'Loamy', 'Sandy', 'Clayey', 'Other'])
    .withMessage('Please specify a recognized soil type.'),
  body('irrigationMethod')
    .optional()
    .isIn(['Drip', 'Sprinkler', 'Flood', 'Rainfed', 'Canal', 'Other'])
    .withMessage('Please specify a valid irrigation method.'),
];

export const cropRules = [
  body('farm')
    .notEmpty()
    .withMessage('Associated farm ID is required.')
    .isMongoId()
    .withMessage('Invalid Farm ID format.'),
  body('cropName')
    .trim()
    .notEmpty()
    .withMessage('Crop name is required.'),
  body('plantingDate')
    .notEmpty()
    .withMessage('Planting date is required.')
    .isISO8601()
    .withMessage('Planting date must be a valid date format.'),
  body('expectedHarvestDate')
    .notEmpty()
    .withMessage('Expected harvest date is required.')
    .isISO8601()
    .withMessage('Expected harvest date must be a valid date format.'),
  body('fieldArea')
    .isFloat({ min: 0 })
    .withMessage('Field area cannot be negative.'),
  body('growthStage')
    .optional()
    .isIn(['Sowing', 'Germination', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity', 'Harvested'])
    .withMessage('Invalid growth stage.'),
];

export const soilReportRules = [
  body('farm')
    .notEmpty()
    .withMessage('Associated farm ID is required.')
    .isMongoId()
    .withMessage('Invalid Farm ID.'),
  body('pH')
    .isFloat({ min: 0, max: 14 })
    .withMessage('pH must be between 0 and 14.'),
  body('nitrogen')
    .isFloat({ min: 0 })
    .withMessage('Nitrogen must be a non-negative number.'),
  body('phosphorus')
    .isFloat({ min: 0 })
    .withMessage('Phosphorus must be a non-negative number.'),
  body('potassium')
    .isFloat({ min: 0 })
    .withMessage('Potassium must be a non-negative number.'),
  body('moisture')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Moisture must be a percentage between 0 and 100.'),
  body('sourceOfMeasurements')
    .optional()
    .isIn(['manual', 'laboratory', 'simulated_demo'])
    .withMessage('Measurement source must be manual, laboratory, or simulated_demo.'),
];

export const mongoIdParamRule = (paramName = 'id') => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName} format.`),
];
