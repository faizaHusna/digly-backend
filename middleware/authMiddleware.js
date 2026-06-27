const jwt = require('jsonwebtoken');
const db = require("../config/mysql"); // 🔥 1. IMPORT KONEKSI DATABASE MYSQL ANDA

// 👤 MIDDLEWARE UNTUK PROTEKSI RUTE MEMBER / AKSES UMUM API
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

    // 🔥 2. CEK STATUS TERBARU USER LANGSUNG KE MYSQL
    db.query("SELECT status FROM users WHERE id = ?", [verified.id], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database Error saat memverifikasi status." });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: "Akun tidak ditemukan di sistem." });
      }

      // Jika admin mengubah status menjadi 'blocked', potong request di sini
      if (results[0].status === 'blocked') {
        return res.status(403).json({ message: "Akses ditolak. Akun Anda telah diblokir oleh pihak perpustakaan!" });
      }

      req.user = verified; 
      next(); // Lolos, silakan lanjut ke controller
    });

  } catch (err) {
    return res.status(400).json({ message: "Token tidak valid atau kadaluwarsa!" });
  }
};

// 🔒 MIDDLEWARE UNTUK PROTEKSI RUTE KHUSUS ADMIN (STATISTIK, AMBIL DATA USER, CRUD BUKU)
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

    // 🔥 3. ADMIN JUGA DICEK (Untuk memastikan akun admin tidak dalam status nonaktif)
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