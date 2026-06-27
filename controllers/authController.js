const db = require("../config/mysql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

 const ActivityLog = require("../models/ActivityLog"); 

// register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        if (result.length > 0) {
          return res.status(400).json({
            message: "Email sudah terdaftar",
          });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
          "INSERT INTO users (name,email,password) VALUES (?,?,?)",
          [name, email, hashedPassword],
          async (err, result) => {
            if (err) {
              return res.status(500).json(err);
            }

            /*
            await ActivityLog.create({
              userId: result.insertId,
              action: "REGISTER",
              description: `${name} berhasil melakukan register`,
            });

            */

            

            res.status(201).json({
              message: "Register sukses",
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

// login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        if (result.length === 0) {
          return res.status(404).json({
            message: "Data user tidak ditemukan",
          });
        }

        const user = result[0];

        if (user.status === 'blocked') {
            return res.status(403).json({ 
                message: "Akun Anda telah dinonaktifkan/diblokir oleh admin. Silakan hubungi pihak perpustakaan." 
            });
        }

        const isMatch = await bcrypt.compare(
          password,
          user.password
        );

        if (!isMatch) {
          return res.status(400).json({
            message: "Password Salah",
          });
        }

        const token = jwt.sign(
          {
            id: user.id,
            role: user.role,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1d",
          }
        );

        // simpan log
        /* await ActivityLog.create({
          userId: user.id,
          action: "LOGIN",
          description: `${user.name} telah login`,
        }); */

        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

// logout
exports.logout = async (req, res) => {
  try {
    const { userId } = req.body;

    /* await ActivityLog.create({
      userId,
      action: "LOGOUT",
      description: "User telah logout",
    });

    */

    res.json({
      message: "Logout berhasil",
    });
  } catch (error) {
    res.status(500).json(error);
  }
};