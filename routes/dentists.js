const express = require('express');
const router = express.Router();
const dentistController = require('../controller/dentistController');
const {
  validateDentistAppointment,
  validateAuthentication,
  validateDentistRegistration,
} = require('../middleware/validationMiddleware');

router.get('/dentist', dentistController.getDentists);
router.get(
  '/dentist/appointments',
  validateAuthentication,
  dentistController.getAppointments
);

router.post(
  '/dentist',
  validateDentistRegistration,
  dentistController.insertDentist
);
router.post(
  '/dentist/book-appointment',
  validateDentistAppointment,
  dentistController.bookAppointment
);

router.post('/dentist/cancel-appointment', dentistController.cancelAppointment);

module.exports = router;
