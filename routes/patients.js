const express = require('express');
const router = express.Router();
const patientsController = require('../controller/patientController');
const {
  validateAuthentication,
  validatePatientAppointment,
  validatePatientRegistration,
} = require('../middleware/validationMiddleware');

router.get('/patient', patientsController.getPatients);
router.get(
  '/patient/appointments',
  validateAuthentication,

  patientsController.getAppointments
);
router.post(
  '/patient',
  validatePatientRegistration,
  patientsController.insertPatient
);
router.post(
  '/patient/book-appointment',
  validatePatientAppointment,
  patientsController.bookAppointment
);

router.post(
  '/patient/cancel-appointment',
  patientsController.cancelAppointment
);

module.exports = router;
