require("dotenv").config();
//require("./config/mongodb");

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes"); // 🛠️ 1. IMPORT RUTE ADMIN BARU
const bookRoutes = require('./routes/bookRoutes');
const memberRoutes = require("./routes/memberRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// ==================== DAFTAR ENDPOINT API ====================

app.use("/api/auth", authRoutes);

// 🔥 2. DAFTARKAN ADMIN DI SINI (Sebelum rute buku agar terhindar dari tabrakan URL :id)
app.use("/api/admin", adminRoutes); 

app.use('/api/books', bookRoutes);
app.use("/api/member", memberRoutes); 

// =============================================================

app.listen(5000, () => {
    console.log("🚀 Server Digly Library Running di port 5000 dengan Rute Admin Aktif!");
});