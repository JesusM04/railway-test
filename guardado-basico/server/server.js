const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2");

const app = express();

// Middleware para parsear JSON
app.use(cors());
app.use(express.json());

// Conexión a la base de datos (puedes usar MySQL, PostgreSQL, etc.)
const db = mysql.createConnection({
    host: process.env.DB_HOST, // Usamos las variables de entorno definidas
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) {
    console.error("Error de conexión: " + err.stack);
    return;
  }
  console.log("Conectado a la base de datos");
});

// Ruta de Registro
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Verificar si el email ya existe
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Error en la base de datos" });
    if (result.length > 0) {
      return res.status(400).json({ message: "El correo electrónico ya está registrado" });
    }

    // Cifrar la contraseña antes de guardarla
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ message: "Error al cifrar la contraseña" });

      // Guardar en la base de datos
      db.query(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, hashedPassword],
        (err, result) => {
          if (err) return res.status(500).json({ message: "Error al registrar" });
          res.status(200).json({ message: "Usuario registrado correctamente" });
        }
      );
    });
  });
});

// Ruta de Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Verificar si el usuario existe
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Error en la base de datos" });
    if (result.length === 0) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    // Comparar las contraseñas
    bcrypt.compare(password, result[0].password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(400).json({ message: "Contraseña incorrecta" });
      }
      res.status(200).json({ message: "Inicio de sesión exitoso" });
    });
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
});
