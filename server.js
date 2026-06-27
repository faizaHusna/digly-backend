require("dotenv").config();
require("./config/mongodb");

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes"); 
const bookRoutes = require('./routes/bookRoutes');
const memberRoutes = require("./routes/memberRoutes");

const app = express();

app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes); 

app.use('/api/books', bookRoutes);
app.use("/api/member", memberRoutes); 


app.listen(5000, () => {
    console.log("🚀 Server Digly Library Running di port 5000 dengan Rute Admin Aktif!");
});