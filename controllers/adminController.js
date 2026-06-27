const db = require("../config/mysql");

// 📊 1. AMBIL STATISTIK AGREGAT UNTUK DASHBOARD ADMIN
exports.getDashboardStats = async (req, res) => {
    try {
        const countBooksQuery = "SELECT COUNT(*) AS total_books FROM books";
        const sumStockQuery = "SELECT SUM(stock) AS total_stock FROM books";
        const countUsersQuery = "SELECT COUNT(*) AS total_users FROM users WHERE role = 'member'";
        const countLoansQuery = "SELECT COUNT(*) AS active_loans FROM borrowings WHERE status = 'borrowed'";

        // Rantai Callback Query MySQL
        db.query(countBooksQuery, (err, booksResult) => {
            if (err) return res.status(500).json({ message: "Gagal menghitung buku", error: err.message });

            db.query(sumStockQuery, (err, stockResult) => {
                if (err) return res.status(500).json({ message: "Gagal menghitung total stok buku", error: err.message });

                db.query(countUsersQuery, (err, usersResult) => {
                    if (err) return res.status(500).json({ message: "Gagal menghitung user", error: err.message });

                    db.query(countLoansQuery, (err, loansResult) => {
                        if (err) return res.status(500).json({ message: "Gagal menghitung peminjaman", error: err.message });

                        // Set Header anti-cache
                        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
                        res.setHeader('Pragma', 'no-cache');
                        res.setHeader('Expires', '0');

                        // Kirim Data Sukses (200)
                        return res.status(200).json({
                            totalBooks: booksResult[0].total_books,
                            totalStock: stockResult[0].total_stock || 0,
                            totalUsers: usersResult[0].total_users,
                            activeLoans: loansResult[0].active_loans
                        });
                    }); // Akhir loans query
                }); // Akhir users query
            }); // Akhir stock query
        }); // Akhir books query

    } catch (error) {
        console.error("Error pada sistem statistik dashboard:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// ➕ 2. TAMBAH BUKU BARU (POST)
exports.addBook = (req, res) => {
    const { isbn, title, author, category, stock, cover_image } = req.body;

    if (!isbn || !title || !author) {
        return res.status(400).json({ message: "ISBN, Judul, dan Penulis wajib diisi!" });
    }

    const queryStr = `
        INSERT INTO books (isbn, title, author, category, stock, cover_image) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [isbn, title, author, category || 'General', stock || 0, cover_image || ''];

    db.query(queryStr, values, (err, result) => {
        if (err) {
            console.error("Gagal menambah buku ke MySQL:", err);
            return res.status(500).json({ message: "Database Error", error: err.message });
        }
        return res.status(201).json({ message: "Buku berhasil ditambahkan!", bookId: result.insertId });
    });
};

// 📝 3. EDIT DATA BUKU (PUT)
exports.updateBook = (req, res) => {
    const { id } = req.params; 
    const { isbn, title, author, category, stock, cover_image } = req.body;

    const queryStr = `
        UPDATE books 
        SET isbn = ?, title = ?, author = ?, category = ?, stock = ?, cover_image = ? 
        WHERE id = ?
    `;
    const values = [isbn, title, author, category, stock, cover_image, id];

    db.query(queryStr, values, (err, result) => {
        if (err) {
            console.error("Gagal mengupdate buku:", err);
            return res.status(500).json({ message: "Database Error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Buku tidak ditemukan di database" });
        }
        return res.status(200).json({ message: "Buku berhasil diperbarui!" });
    });
};

// 🗑️ 4. HAPUS BUKU (DELETE)
exports.deleteBook = (req, res) => {
    const { id } = req.params;

    const queryStr = "DELETE FROM books WHERE id = ?";

    db.query(queryStr, [id], (err, result) => {
        if (err) {
            console.error("Gagal menghapus buku:", err);
            return res.status(500).json({ message: "Database Error" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Buku tidak ditemukan" });
        }
        return res.status(200).json({ message: "Buku berhasil dihapus dari sistem!" });
    });
};

exports.getAllUsers = (req, res) => {
    // Mengambil data user yang bukan admin agar admin tidak bisa memblokir sesama admin secara tidak sengaja
    const queryStr = "SELECT id, name, email, role, status, created_at FROM users WHERE role = 'member' ORDER BY created_at DESC";

    db.query(queryStr, (err, results) => {
        if (err) {
            console.error("Gagal mengambil data users:", err);
            return res.status(500).json({ message: "Database Error saat memuat user." });
        }
        return res.status(200).json(results);
    });
};

// 🚫 2. MODERASI STATUS USER (PUT - Block / Unblock)
exports.toggleUserStatus = (req, res) => {
    const { id } = req.params;
    const { currentStatus } = req.body; // Ambil status saat ini dari frontend

    // Balikkan statusnya: jika 'active' ubah ke 'blocked', begitu sebaliknya
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';

    const queryStr = "UPDATE users SET status = ? WHERE id = ?";

    db.query(queryStr, [newStatus, id], (err, result) => {
        if (err) {
            console.error("Gagal mengubah status user:", err);
            return res.status(500).json({ message: "Database Error saat update status." });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User tidak ditemukan." });
        }
        return res.status(200).json({ message: `Status user berhasil diubah menjadi ${newStatus}!`, newStatus });
    });
};

// 🗑️ 3. HAPUS AKUN USER (DELETE)
exports.deleteUser = (req, res) => {
    const { id } = req.params;
    const queryStr = "DELETE FROM users WHERE id = ? AND role = 'member'";

    db.query(queryStr, [id], (err, result) => {
        if (err) {
            console.error("Gagal menghapus user:", err);
            return res.status(500).json({ message: "Database Error saat menghapus akun." });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User tidak ditemukan atau Anda tidak memiliki akses." });
        }
        return res.status(200).json({ message: "Akun user berhasil dihapus dari database!" });
    });
};

// 📋 1. AMBIL SEMUA RIWAYAT PEMINJAMAN AKTIF & SELESAI (GET)
exports.getAllLoans = (req, res) => {
    // Menggunakan JOIN agar kita bisa mendapatkan nama user dan judul buku secara gamblang
    const queryStr = `
        SELECT 
            b.id AS loan_id,
            u.name AS user_name,
            bk.title AS book_title,
            bk.id AS book_id,
            b.borrow_date,
            b.return_date,
            b.status
        FROM borrowings b
        JOIN users u ON b.user_id = u.id
        JOIN books bk ON b.book_id = bk.id
        ORDER BY b.borrow_date DESC
    `;

    db.query(queryStr, (err, results) => {
        if (err) {
            console.error("Gagal mengambil data peminjaman:", err);
            return res.status(500).json({ message: "Database Error saat memuat data transaksi." });
        }
        return res.status(200).json(results);
    });
};

// 🔄 2. PROSES PENGEMBALIAN BUKU (PUT)
exports.returnBook = (req, res) => {
    const { id } = req.params; // Ini adalah loan_id (ID Transaksi)
    const { bookId } = req.body; // Kita butuh bookId untuk mengembalikan stoknya ke tabel books

    // Langkah A: Ubah status peminjaman menjadi 'returned'
    const updateLoanQuery = "UPDATE borrowings SET status = 'returned', return_date = NOW() WHERE id = ?";

    db.query(updateLoanQuery, [id], (err, result) => {
        if (err) {
            console.error("Gagal memperbarui status peminjaman:", err);
            return res.status(500).json({ message: "Database Error saat memproses pengembalian." });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Data peminjaman tidak ditemukan." });
        }

        // Langkah B: Otomatis tambahkan stok buku kembali sebanyak +1 di MySQL
        const updateStockQuery = "UPDATE books SET stock = stock + 1 WHERE id = ?";
        
        db.query(updateStockQuery, [bookId], (err, stockResult) => {
            if (err) {
                console.error("Gagal mengembalikan stok buku:", err);
                return res.status(500).json({ message: "Status terupdate, namun gagal menambahkan stok buku." });
            }
            
            return res.status(200).json({ message: "Buku berhasil dikembalikan dan stok telah ditambahkan kembali!" });
        });
    });
};