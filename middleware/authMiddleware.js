const jwt = require('jsonwebtoken');
const db = require("../config/mysql"); 

const verifyMember = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Akses ditolak, token tidak ditemukan!" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    if (verified.role !== 'member' && verified.role !== 'admin') {
      return res.status(403).json({ message: "Akses ditolak, peran tidak dikenali!" });
    }

    db.query("SELECT status FROM users WHERE id = ?", [verified.id], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database Error saat memverifikasi status." });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: "Akun tidak ditemukan di sistem." });
      }

      if (results[0].status === 'blocked') {
        return res.status(403).json({ message: "Akses ditolak. Akun Anda telah diblokir oleh pihak perpustakaan!" });
      }

      req.user = verified; 
      next(); 
    });

  } catch (err) {
    return res.status(400).json({ message: "Token tidak valid atau kadaluwarsa!" });
  }
};

const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Akses ditolak, token tidak ditemukan!" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    if (verified.role !== 'admin') {
      return res.status(403).json({ message: "Akses ditolak, area khusus Admin!" });
    }

    db.query("SELECT status FROM users WHERE id = ?", [verified.id], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database Error." });
      }
      
      if (results.length === 0 || results[0].status === 'blocked') {
        return res.status(403).json({ message: "Akses ditolak. Sesi admin tidak aktif!" });
      }

      req.user = verified; 
      next(); 
    });

  } catch (err) {
    return res.status(400).json({ message: "Token tidak valid atau kadaluwarsa!" });
  }
};

module.exports = { verifyMember, verifyAdmin };