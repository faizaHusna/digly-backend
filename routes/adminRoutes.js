const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyAdmin } = require("../middleware/authMiddleware"); 

router.get("/stats", verifyAdmin, adminController.getDashboardStats); 
router.post("/books", verifyAdmin, adminController.addBook);         
router.put("/books/:id", verifyAdmin, adminController.updateBook);    
router.delete("/books/:id", verifyAdmin, adminController.deleteBook); 

router.get("/users", verifyAdmin, adminController.getAllUsers);                      // Ambil semua member
router.put("/users/status/:id", verifyAdmin, adminController.toggleUserStatus);      // Block atau Unblock user
router.delete("/users/:id", verifyAdmin, adminController.deleteUser);                // Hapus akun user

router.get("/loans", verifyAdmin, adminController.getAllLoans);               // Ambil daftar sirkulasi buku
router.put("/loans/return/:id", verifyAdmin, adminController.returnBook);

module.exports = router;