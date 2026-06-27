const express = require("express");
const router = express.Router();

const { verifyMember } = require("../middleware/authMiddleware"); 

const memberController = require("../controllers/memberController");

// 1. Rute untuk mengambil history peminjaman (GET)
router.get("/history", verifyMember, memberController.getMyHistory);

// 2. Rute untuk meminjam buku (POST)
router.post("/borrow", verifyMember, memberController.borrowBook);

router.post("/return", verifyMember, memberController.returnBook);

module.exports = router;