const connection = require('../db/db');
const bcrypt = require('bcrypt');
const UserDTO = require("../dto/UserDTO");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await connection.query(
      'SELECT * FROM user where username = ? ',
      [username]
    );

    if (rows.length > 0) {
      const user = rows[0];

      const passwordMatch = await bcrypt.compare(password, user.password);

      if(!passwordMatch) {
        return res.status(401).send({error: 'Invalid password'});
      }

      req.session.user = new UserDTO(
        user.id,
        user.first_name,
        user.last_name,
        user.username,
        user.role
      );

      return res.status(200).send({
        user: req.session.user,
        msg: 'User logged in successfully',
      });
    } else {
      return res.status(404).send({error: 'Username not found'});
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
