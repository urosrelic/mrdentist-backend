const connection = require('../db/db');

const ROLES = require('../constants/roles');

const getPatients = async (req, res) => {
  try {
    const [rows] = await connection.query('SELECT * FROM user WHERE role = ?', [
      ROLES.ROLE_PATIENT,
    ]);
    return res.json(rows);
  } catch (error) {
    console.error('Error querying database:', error);
  }
};

const insertPatient = async (req, res) => {
  try {
    const { username, firstName, lastName } = req.body;

    // Check if the citizen number already exists in the database
    const [existingPatient] = await connection.query(
      'SELECT * FROM user WHERE username = ? AND role = ?',
      [username, ROLES.ROLE_PATIENT]
    );

    if (existingPatient.length > 0) {
      return res.status(400).json({ error: 'Citizen number already exists' });
    }

    const [result] = await connection.query(
      'INSERT INTO user (first_name, last_name, username, role) VALUES (?, ?, ?, ?)',
      [firstName, lastName, username, ROLES.ROLE_PATIENT]
    );

    return res.status(201).json({
      message: 'Patient created successfully',
      patientId: result.insertId,
    });
  } catch (error) {
    console.error('Error inserting patient:', error);
    return res.status(500).json({ error: 'Failed to insert patient' });
  }
};

const bookAppointment = async (req, res) => {
  try {
    const patient = req.session.user;
    const { dentistId, type, date, duration } = req.body;
    console.log(`dentist id: ${dentistId}`);
    // Find dentist by unique identifier
    const [rows] = await connection.query(
      'SELECT * FROM user WHERE id = ? AND role = ?',
      [dentistId, ROLES.ROLE_DENTIST]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Dentist not found' });
    }

    const dentist = rows[0];
    console.log(dentist);

    const [result] = await connection.query(
      'INSERT INTO appointment (dentist_id, patient_id, type, date, duration) VALUES (?, ?, ?, ?, ?)',
      [dentist.id, patient.id, type, date, duration]
    );
    return res.status(201).json({
      message: 'Appointment booked successfully',
      appointmentId: result.insertId,
    });
  } catch (error) {
    console.error('Error booking appointment', error);
    return res.status(500).json({ error: 'Failed to book appointment' });
  }
};

const getAppointments = async (req, res) => {
  try {
    const patientId = req.session.user.id;
    const [rows] = await connection.query(
      'SELECT * FROM appointment where patient_id = ?',
      [patientId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        error: 'No appointments found for patient with ID: ' + patientId,
      });
    }

    return res.status(200).json({ appointments: rows });
  } catch (error) {
    console.error('Error getting appointments for patient', error);
    res.status(500).json({ error: 'Failed to get appointments' });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const patientId = req.session.user.id;

    const { appointmentId } = req.body;

    const [appointment] = await connection.query(
      'SELECT date FROM appointment WHERE id = ? and patient_id = ?',
      [appointmentId, patientId]
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
  getPatients,
  cancelAppointment,
  insertPatient,
  bookAppointment,
  getAppointments,
};
