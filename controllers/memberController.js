const db = require("../config/mysql");
const ActivityLog = require("../models/ActivityLog");


exports.getMyHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const queryStr = `
            SELECT 
                b.id AS borrowing_id, 
                b.user_id, 
                b.book_id, 
                b.borrow_date, 
                b.due_date, 
                b.return_date, 
                b.status, 
                bk.title, 
                bk.author, 
                bk.cover_image,
                bk.stock,
                bk.id AS real_book_id
            FROM borrowings b
            INNER JOIN books bk ON b.book_id = bk.id 
            WHERE b.user_id = ? 
            ORDER BY b.borrow_date DESC
        `;

        console.log("=== MEMANGGIL RIWAYAT USER ID:", userId, "===");

        db.query(queryStr, [userId], (err, result) => {
            if (err) {
                console.error(" ERROR MYSQL PADA HISTORY:", err.message);
                return res.status(500).json({
                    message: "Gagal mengeksekusi query database riwayat",
                    error: err.message
                });
            }

            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');

            console.log(" Berhasil memuat", result.length, "data riwayat.");
            return res.status(200).json(result);
        });
    } catch (error) {
        console.error(" ERROR SISTEM HISTORY:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


    

exports.borrowBook = async (req, res) => {
    try {
        const userId = req.user.id;
        const { book_id } = req.body; 

        console.log("=== PROSES VERIFIKASI DIGLYDB ===");
        
        db.query("SELECT id, stock, title FROM books WHERE isbn = ?", [book_id], (err, bookResult) => {
            if (err) return res.status(500).json(err);

            if (bookResult.length === 0) {
                return res.status(404).json({ message: "Buku tidak ditemukan di database" });
            }

            const book = bookResult[0];
            const realBookIdInt = book.id;

            const checkDuplicateQuery = "SELECT id FROM borrowings WHERE user_id = ? AND book_id = ? AND status = 'borrowed'";
            
            db.query(checkDuplicateQuery, [userId, realBookIdInt], (err, duplicateResult) => {
                if (err) return res.status(500).json(err);

                if (duplicateResult.length > 0) {
                    return res.status(400).json({ 
                        message: "Anda sudah meminjam buku ini sebelumnya dan belum mengembalikannya!",
                        alreadyBorrowed: true 
                    });
                }

                if (book.stock <= 0) {
                    return res.status(400).json({ message: "Maaf, stok buku sudah habis!" });
                }

                db.query("UPDATE books SET stock = stock - 1 WHERE id = ?", [realBookIdInt], (err) => {
                    if (err) return res.status(500).json(err);

                    const now = new Date();
                    const borrowDate = now.toISOString().split('T')[0];
                    const due = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    const dueDate = due.toISOString().split('T')[0];

                    const insertQuery = `
                        INSERT INTO borrowings (user_id, book_id, borrow_date, due_date, status) 
                        VALUES (?, ?, ?, ?, 'borrowed')
                    `;

                    db.query(insertQuery, [userId, realBookIdInt, borrowDate, dueDate], (err, insertResult) => {
                        if (err) return res.status(500).json(err);

                        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
                        return res.status(201).json({
                            message: "Buku berhasil dipinjam!",
                            borrowId: insertResult.insertId
                        });
                    });
                });
            });
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

exports.returnBook = async (req, res) => {
    try {
        const userId = req.user.id;
        const { borrowing_id } = req.body;

        const returnDate = new Date().toISOString().split('T')[0];

        db.query("SELECT * FROM borrowings WHERE id = ? AND user_id = ?", [borrowing_id, userId], (err, borrowResult) => {
            if (err) return res.status(500).json(err);

            if (borrowResult.length === 0) {
                return res.status(404).json({ message: "Data peminjaman tidak valid" });
            }

            const borrowData = borrowResult[0];

            if (borrowData.status === "returned") {
                return res.status(400).json({ message: "Buku ini sudah dikembalikan sebelumnya" });
            }

            db.query("UPDATE books SET stock = stock + 1 WHERE id = ?", [borrowData.book_id], (err) => {
                if (err) return res.status(500).json(err);

                const updateQuery = `
                    UPDATE borrowings
                    SET status = 'returned', return_date = ? 
                    WHERE id = ?
                `;

                db.query(updateQuery, [returnDate, borrowing_id], async (err) => {
                    if (err) return res.status(500).json(err);

                    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
                    res.status(200).json({ message: "Buku berhasil dikembalikan!" });
                });
            });
        });
    } catch (error) {
        res.status(500).json(error);
    }
};