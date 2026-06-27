const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyAdmin } = require("../middleware/authMiddleware"); 

router.get("/stats", verifyAdmin, adminController.getDashboardStats); 
router.post("/books", verifyAdmin, adminController.addBook);         
router.put("/books/:id", verifyAdmin, adminController.updateBook);    
router.delete("/books/:id", verifyAdmin, adminController.deleteBook); 

router.get("/users", verifyAdmin, adminController.getAllUsers);                      
router.put("/users/status/:id", verifyAdmin, adminController.toggleUserStatus);     
router.delete("/users/:id", verifyAdmin, adminController.deleteUser);                

router.get("/loans", verifyAdmin, adminController.getAllLoans);               
router.put("/loans/return/:id", verifyAdmin, adminController.returnBook);

module.exports = router;