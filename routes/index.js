const express = require('express');
const router = express.Router();
const patientRouter = require('../routes/patients');
const dentistRouter = require('../routes/dentists');
const authRouter = require('../routes/auth');

router.use(patientRouter);
router.use(dentistRouter);
router.use(authRouter);

router.get('/', (req, res) => {
  res.send('Hello, World!');
});

module.exports = router;
