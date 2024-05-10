const ROLES = require('../constants/roles');
const connection = require('../db/db');

const validatePatientRegistration = (req, res, next) => {
  const { firstName, lastName, username } = req.body;

  if (!firstName || !lastName || !username) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  next();
};

const validateDentistRegistration = (req, res, next) => {
  const { firstName, lastName } = req.body;

  if (!firstName || !lastName) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  next();
};

const validateAuthentication = async (req, res, next) => {
  const user = req.session.user;

  if (!user) {
    return res.status(400).json({ msg: 'User not logged in' });
  }

  next();
};

const validateDentistAppointment = async (req, res, next) => {
  const dentistId = req.session.user.id;
  const { patientId, date, duration } = req.body;

  const appointmentDate = new Date(date);
  const appointmentHour = appointmentDate.getHours();
  const appointmentEndDate = new Date(
    appointmentDate.getTime() + duration * 60000
  );

  // Check if the appointment is within working hours
  if (appointmentHour < 9 || appointmentHour >= 17) {
    return res.status(400).json({
      error: 'Appointments can only be booked between 9:00 AM and 5:00 PM',
    });
  }

  // Check if the appointment is on the hour or half-hour
  if (
    appointmentDate.getMinutes() !== 0 &&
    appointmentDate.getMinutes() !== 30
  ) {
    return res.status(400).json({
      error: 'Appointments can only be booked on the hour or half-hour',
    });
  }

  // Check if the appointment duration is valid
  if (duration !== 30 && duration !== 60) {
    return res.status(400).json({
      error: 'Appointments can only be 30 or 60 minutes long',
    });
  }

  // Check if the appointment slot is available
  const [existingAppointments] = await connection.query(
    'SELECT * FROM appointment WHERE dentist_id = ? AND date < ? AND DATE_ADD(date, INTERVAL duration MINUTE) > ?',
    [dentistId, appointmentEndDate, appointmentDate]
  );

  if (existingAppointments.length > 0) {
    return res.status(400).json({
      error: 'The requested appointment slot is not available',
    });
  }

  next();
};

const validatePatientAppointment = async (req, res, next) => {
  const patientId = req.session.user.id;
  const { date, duration } = req.body;

  const appointmentDate = new Date(date);
  const appointmentHour = appointmentDate.getHours();
  const appointmentEndDate = new Date(
    appointmentDate.getTime() + duration * 60000
  );

  // Check if the appointment is within working hours
  if (appointmentHour < 9 || appointmentHour >= 17) {
    return res.status(400).json({
      error: 'Appointments can only be booked between 9:00 AM and 5:00 PM',
    });
  }

  // Check if the appointment is on the hour or half-hour
  if (
    appointmentDate.getMinutes() !== 0 &&
    appointmentDate.getMinutes() !== 30
  ) {
    return res.status(400).json({
      error: 'Appointments can only be booked on the hour or half-hour',
    });
  }

  // Check if the appointment duration is valid
  if (duration !== 30 && duration !== 60) {
    return res.status(400).json({
      error: 'Appointments can only be 30 or 60 minutes long',
    });
  }

  // Check if the appointment slot is available
  const [existingAppointments] = await connection.query(
    'SELECT * FROM appointment WHERE patient_id = ? AND date < ? AND DATE_ADD(date, INTERVAL duration MINUTE) > ?',
    [patientId, appointmentEndDate, appointmentDate]
  );

  if (existingAppointments.length > 0) {
    return res.status(400).json({
      error: 'The requested appointment slot is not available',
    });
  }

  next();
};

const validatePatientId = async (req, res, next) => {
  const { username } = req.body;

  const [patients] = await connection.query(
    'SELECT * FROM user WHERE username = ? and role = ?',
    [username, ROLES.ROLE_PATIENT]
  );

  if (patients.length === 0) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  next();
};

module.exports = {
  validatePatientId,
  validateAuthentication,
  validateDentistAppointment,
  validatePatientAppointment,
  validatePatientRegistration,
  validateDentistRegistration,
};
