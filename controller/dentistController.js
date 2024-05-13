const connection = require('../db/db');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const ROLES = require('../constants/roles');
const bcrypt = require("bcrypt");

const getDentists = async (req, res) => {
  try {
    const [rows] = await connection.query('SELECT * FROM user WHERE role = ?', [
      ROLES.ROLE_DENTIST,
    ]);
    res.json(rows);
  } catch (error) {
    console.error('Error retrieving dentists:', error);
    res.status(500).json({ error: 'Failed to retrieve dentists' });
  }
};

const getAppointments = async (req, res) => {
  try {
    const dentistId = req.session.user.id;
    console.log(req.session.user);

    const [rows] = await connection.query(
      'SELECT * FROM appointment WHERE dentist_id = ?',
      [dentistId]
    );

    // Check if appointments are found for the provided dentistId
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        error: 'No appointments found for dentist with ID: ' + dentistId,
      });
    }

    // If both checks pass, return the appointments
    return res.status(200).json({ appointments: rows });
  } catch (error) {
    console.error('Error retrieving appointments:', error);
    return res.status(500).json({ error: 'Failed to retrieve appointments' });
  }
};

const register = async (req, res) => {
  try {
    const { firstName, lastName, password } = req.body;

    const uuid = uuidv4();
    const hashedUuid = crypto.createHash('sha256').update(uuid).digest('hex');
    const shortHashedUuid = hashedUuid.substring(0, 6);
    const username = `mrdentist-${firstName}${lastName}-${shortHashedUuid}`;

    const [existingDentist] = await connection.query(
      'SELECT * FROM user where username = ? AND role = ?',
      [username, ROLES.ROLE_DENTIST]
    );

    if (existingDentist.length > 0) {
      return res.status(400).json({
        error: `Dentist already exists with provided unique identifier ${uniqueIdentifier}`,
      });
    }

    // hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await connection.query(
      'INSERT INTO user (first_name, last_name, username, password, role) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, username, hashedPassword, ROLES.ROLE_DENTIST]
    );

    return res.status(201).json({
      message: 'Dentist created successfully',
      dentistId: result.insertId,
    });
  } catch (error) {
    console.error('Error inserting dentist:', error);
    return res.status(500).json({ error: 'Failed to insert dentist' });
  }
};

const bookAppointment = async (req, res) => {
  try {
    const dentistId = req.session.user.id;
    const { username, type, date, duration } = req.body;

    console.log(duration);

    // Find patient by username
    const [rows] = await connection.query(
      'SELECT * FROM user WHERE username = ? AND role = ?',
      [username, ROLES.ROLE_PATIENT]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patient = rows[0];
    console.log('formatted date' + new Date(date));
    console.log('body date' + date);
    const [result] = await connection.query(
      'INSERT INTO appointment (dentist_id, patient_id, type, date, duration) VALUES (?, ?, ?, ?, ?)',
      [dentistId, patient.id, type, new Date(date), duration]
    );

    res.status(200).json({
      message: `Appointment booked successfully for patient ${patient.username}`,
      appointmentId: result.insertId,
    });
  } catch (error) {
    console.error('Error booking appointment ', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const dentistId = req.session.user.id;

    const { appointmentId } = req.body;

    const [appointment] = await connection.query(
      'SELECT date FROM appointment WHERE id = ? and dentist_id = ?',
      [appointmentId, dentistId, dentistId]
    );

    if (appointment.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointmentDate = new Date(appointment[0].date);
    const currentDate = new Date();

    // Check if the appointment is less than 24 hours away
    if (
      appointmentDate.getTime() - currentDate.getTime() <
      24 * 60 * 60 * 1000
    ) {
      return res.status(400).json({
        error: 'Appointment can only be cancelled 24 hours in advance',
      });
    }

    const [result] = await connection.query(
      'DELETE FROM appointment WHERE id = ?',
      [appointmentId]
    );

    res.status(200).json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
};

module.exports = {
  getDentists,
  register,
  cancelAppointment,
  bookAppointment,
  getAppointments,
};
