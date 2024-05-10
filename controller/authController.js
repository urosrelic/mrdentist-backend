const connection = require('../db/db');
const ROLES = require('../constants/roles');

const login = async (req, res) => {
  try {
    const { username } = req.body;

    const [rows] = await connection.query(
      'SELECT * FROM user where username = ? AND role = ?',
      [username, ROLES.ROLE_PATIENT]
    );

    if (rows.length > 0) {
      req.session.user = rows[0]; // Save patient information in session
      return res.status(200).send({
        user: req.session.user,
        msg: 'Patient logged in successfully',
      });
    } else {
      const [rows] = await connection.query(
        'SELECT * FROM user WHERE username = ? AND role = ?',
        [username, ROLES.ROLE_DENTIST]
      );

      if (rows.length > 0) {
        req.session.user = rows[0]; // Save dentist information in session
        return res.status(200).send({
          user: req.session.user,
          msg: 'Dentist logged in successfully',
        });
      } else {
        return res.status(404).send('Username not found');
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Error trying to login' });
  }
};

const logout = (req, res) => {
  if (!req.session.user) {
    return res.status(400).send({ error: 'User not logged in' });
  }

  const username = req.session.user.username;

  return req.session.destroy((err) => {
    if (err) {
      return res.status(500).send({ error: 'Could not log out' });
    } else {
      res.status(200).send({
        msg: 'Successfully logged out user: ' + username,
      });
    }
  });
};

module.exports = { login, logout };
