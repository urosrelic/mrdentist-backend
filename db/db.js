const mysql = require('mysql2');
const ROLES = require('../constants/roles');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'mrdentist',
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database!');

  const createAppointmentTable = `
  CREATE TABLE IF NOT EXISTS appointment (
    id int NOT NULL AUTO_INCREMENT,
    dentist_id int DEFAULT NULL,
    patient_id int DEFAULT NULL,
    type varchar(255) DEFAULT NULL,
    date datetime DEFAULT NULL,
    duration int DEFAULT NULL,
    PRIMARY KEY (id),
    KEY dentist_id (dentist_id),
    KEY patient_id (patient_id),
    CONSTRAINT appointment_ibfk_1 FOREIGN KEY (dentist_id) REFERENCES user (id),
    CONSTRAINT appointment_ibfk_2 FOREIGN KEY (patient_id) REFERENCES user (id)
  ) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
`;

  const createUserTable = `
    CREATE TABLE IF NOT EXISTS user (
      id int NOT NULL AUTO_INCREMENT,
      first_name varchar(255) DEFAULT NULL,

      last_name varchar(255) DEFAULT NULL,
      username varchar(255) DEFAULT NULL,
        password varchar(255) DEFAULT NULL,
      role varchar(255) DEFAULT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  `;

  connection.query(createUserTable, function (err, results, fields) {
    if (err) throw err;
  });

  connection.query(createAppointmentTable, function (err, results, fields) {
    if (err) throw err;
  });
});

module.exports = connection.promise();
