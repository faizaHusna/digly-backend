const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require("../config/mysql");

const DATABASE_BUKU_LOKAL = require('../../frontend/src/data/books').default;

const LIST_ISBN = [
    // Tech & Programming
    "0132350882", "0131103628", "0201633612", "9780135957059", "1491950293",
    // Finance & Business
    "0857197681", "0060752610", "9780060583286", "0446310786", "0735201447",
    // Productivity & Self Improvement
    "1455586692", "0735211299", "0307463745", "0743269519", "0671027034",
    // Fantasy & Sci-Fi
    "9780316381994", "0590353403", "0345339681", "0345538374", "0451524934",
    "0345391802", "0553103547", "0441172717", "0345325818", "0618260552",
    // Classic & Fiction
    "0743273567", "0061122416", "0316769487", "0451526341", "0141439513",
    "0060850523", "0399501487", "0486282112", "0385050402",
    // History & Biography
    "0062316095", "0374275637", "1594138850", "9788499928333", "9781598531459",
    // Mystery & Thriller
    "0385121679", "0316693642", "0385504209", "0099580160", "1409139484",
    // Popular Indonesia
    "9786024246945", "9793062797"
];

const dapatkanKategori = (isbn) => {
// Tech & Programming
if (isbn === "0132350882") return "Programming";
if (isbn === "0131103628") return "Programming";
if (isbn === "0201633612") return "Programming";
if (isbn === "9780135957059") return "Programming";
if (isbn === "1491950293") return "Programming";

// Finance & Business
if (isbn === "0857197681") return "Finance";
if (isbn === "0060752610") return "Finance";
if (isbn === "9780060583286") return "Finance";
if (isbn === "0446310786") return "Finance";
if (isbn === "0735201447") return "Finance";

// Productivity & Self Improvement
if (isbn === "1455586692") return "Productivity";
if (isbn === "0735211299") return "Self Improvement";
if (isbn === "0307463745") return "Self Improvement";
if (isbn === "0743269519") return "Self Improvement";
if (isbn === "0671027034") return "Self Improvement";

// Fantasy & Sci-Fi
if (isbn === "9780316381994") return "Children Book";
if (isbn === "0590353403") return "Fantasy";
if (isbn === "0345339681") return "Fantasy";
if (isbn === "0345538374") return "Fantasy";
if (isbn === "0451524934") return "Sci-Fi / Fiction";
if (isbn === "0345391802") return "Sci-Fi / Fiction";
if (isbn === "0553103547") return "Fantasy";
if (isbn === "0441172717") return "Sci-Fi / Fiction";
if (isbn === "0345325818") return "Fantasy";
if (isbn === "0618260552") return "Fantasy";

// Classic & Fiction
if (isbn === "0743273567") return "Classic Literature";
if (isbn === "0061122416") return "Fiction";
if (isbn === "0316769487") return "Classic Literature";
if (isbn === "0451526341") return "Classic Literature";
if (isbn === "0141439513") return "Classic Literature";
if (isbn === "0060850523") return "Fiction";
if (isbn === "0399501487") return "Classic Literature";
if (isbn === "0486282112") return "Classic Literature";
if (isbn === "0385050402") return "Classic Literature";

// History & Biography
if (isbn === "0062316095") return "History";
if (isbn === "0374275637") return "Psychology";
if (isbn === "1594138850") return "Biography";
if (isbn === "9788499928333") return "Biography";
if (isbn === "9781598531459") return "History";

// Mystery & Thriller
if (isbn === "0385121679") return "Mystery";
if (isbn === "0316693642") return "Mystery";
if (isbn === "0385504209") return "Mystery";
if (isbn === "0099580160") return "Mystery";
if (isbn === "1409139484") return "Mystery";

// Popular Indonesia
if (isbn === "9786024246945") return "Historical Fiction";
if (isbn === "9793062797") return "Fiction";

return "General";
};

const dapatkanStok = (isbn) => {
if (isbn === "0132350882") return 5;
if (isbn === "0131103628") return 3;
if (isbn === "0201633612") return 4;
if (isbn === "9780135957059") return 2;
if (isbn === "1491950293") return 6;
if (isbn === "0857197681") return 3;
if (isbn === "0060752610") return 8;
if (isbn === "9780060583286") return 2;
if (isbn === "0446310786") return 5;
if (isbn === "0735201447") return 7;
if (isbn === "1455586692") return 0;
if (isbn === "0735211299") return 10;
if (isbn === "0307463745") return 4;
if (isbn === "0743269519") return 6;
if (isbn === "0671027034") return 3;
if (isbn === "9780316381994") return 8;
if (isbn === "0590353403") return 4;
if (isbn === "0345339681") return 6;
if (isbn === "0345538374") return 8;
if (isbn === "0451524934") return 2;
if (isbn === "0345391802") return 5;
if (isbn === "0553103547") return 1;
if (isbn === "0441172717") return 4;
if (isbn === "0345325818") return 3;
if (isbn === "0618260552") return 6;
if (isbn === "0743273567") return 2;
if (isbn === "0061122416") return 9;
if (isbn === "0316769487") return 5;
if (isbn === "0451526341") return 4;
if (isbn === "0141439513") return 3;
if (isbn === "0060850523") return 6;
if (isbn === "0399501487") return 2;
if (isbn === "0486282112") return 5;
if (isbn === "0385050402") return 4;
if (isbn === "0062316095") return 5;
if (isbn === "0374275637") return 3;
if (isbn === "1594138850") return 2;
if (isbn === "9788499928333") return 4;
if (isbn === "9781598531459") return 3;
if (isbn === "0385121679") return 4;
if (isbn === "0316693642") return 2;
if (isbn === "0385504209") return 6;
if (isbn === "0099580160") return 3;
if (isbn === "1409139484") return 5;
if (isbn === "9786024246945") return 8;
if (isbn === "9793062797") return 4;

return 2;
};

const bagiMenjadiPotongan = (array, ukuran) => {
    const hasil = [];
    for (let i = 0; i < array.length; i += ukuran) {
        hasil.push(array.slice(i, i + ukuran));
    }
    return hasil;
};


router.get('/', async (req, res) => {
    try {
        const queryStr = "SELECT * FROM books";
        
        db.query(queryStr, async (err, dbBooks) => {
            if (err) {
                console.error("Gagal mengambil data dari MySQL:", err);
                return res.status(500).json({ message: "Database Error" });
            }

            const listIsbnDariDb = dbBooks.map(b => b.isbn);
            const kelompokIsbn = bagiMenjadiPotongan(listIsbnDariDb, 10);
            let dataMerged = {};

            const semuaRequest = kelompokIsbn.map(kelompok => {
                const parameterBibkeys = kelompok.map(isbn => `ISBN:${isbn}`).join(',');
                return axios.get(`https://openlibrary.org/api/books?bibkeys=${parameterBibkeys}&format=json&jscmd=data`, {
                    timeout: 4000
                });
            });

            try {
                const hasilResponses = await Promise.all(semuaRequest);
                hasilResponses.forEach(response => {
                    dataMerged = { ...dataMerged, ...response.data };
                });
            } catch (apiErr) {
                console.warn("⚠️ Open Library API Timeout. Menggunakan data murni MySQL.");
            }

            const daftarBukuFinal = dbBooks.map((mysqlBook) => {
                const bookData = dataMerged[`ISBN:${mysqlBook.isbn}`];

                return {
                    id: mysqlBook.id, 
                    isbn: mysqlBook.isbn,
                    title: mysqlBook.title || (bookData ? bookData.title : 'Unknown Title'),
                    author: mysqlBook.author || (bookData && bookData.authors ? bookData.authors[0].name : 'Unknown Author'),
                    category: mysqlBook.category || 'General',
                    stock: mysqlBook.stock, 
                    year: bookData ? (bookData.publish_date || 'Unknown') : 'Unknown',
                    pages: bookData ? (bookData.number_of_pages || '-') : '-',
                    cover_image: mysqlBook.cover_image || (bookData && bookData.cover ? bookData.cover.large : `https://covers.openlibrary.org/b/isbn/${mysqlBook.isbn}-L.jpg`)
                };
            });

            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');

            return res.json(daftarBukuFinal);
        });

    } catch (error) {
        console.error("⚠️ Sistem error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


/*

router.get("/", (req, res) => {
    const queryStr = "SELECT * FROM books ORDER BY id DESC";

    db.query(queryStr, (err, result) => {
        if (err) {
            console.error("Gagal mengambil katalog buku dari MySQL:", err);
            return res.status(500).json({ message: "Internal Server Error", error: err.message });
        }

        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        return res.status(200).json(result);
    });
});
*/



router.get('/search', (req, res) => {
    const kataKunci = req.query.q ? req.query.q.toLowerCase() : "";

    if (!kataKunci) return res.json([]);

    const queryStr = "SELECT * FROM books WHERE LOWER(title) LIKE ? OR LOWER(author) LIKE ? OR LOWER(category) LIKE ?";
    const values = [`%${kataKunci}%`, `%${kataKunci}%`, `%${kataKunci}%`];

    db.query(queryStr, values, (err, result) => {
        if (err) return res.status(500).json(err);
        
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        return res.status(200).json(result);
    });
});



router.get('/:isbn', async (req, res) => {
    const { isbn } = req.params; 

    const queryStr = "SELECT * FROM books WHERE id = ? OR isbn = ?";
    
    db.query(queryStr, [isbn, isbn], async (err, dbResult) => {
        if (!err && dbResult.length > 0) {
            const mysqlBook = dbResult[0];
            const actualIsbn = mysqlBook.isbn;

            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');

            try {
                const response = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${actualIsbn}&format=json&jscmd=data`, {
                    timeout: 2000 
                });
                
                const bookData = response.data[`ISBN:${actualIsbn}`];
                let deskripsiOtomatis = "Tidak ada deskripsi untuk buku ini.";
                
                if (bookData) {
                    if (bookData.description) {
                        deskripsiOtomatis = typeof bookData.description === 'object' ? bookData.description.value : bookData.description;
                    } else if (bookData.notes) {
                        deskripsiOtomatis = bookData.notes;
                    } else if (bookData.subjects && bookData.subjects.length > 0) {
                        const topik = bookData.subjects.map(s => s.name).slice(0, 5).join(', ');
                        deskripsiOtomatis = `This book covers themes regarding ${topik}.`;
                    }
                }

                return res.json({
                    ...mysqlBook,
                    id: mysqlBook.id, 
                    isbn: actualIsbn,
                    description: deskripsiOtomatis
                });

            } catch (apiErr) {
                const deskripsiPajangan = `An exceptional masterpiece regarding ${mysqlBook.category || 'Literature'}. Perfect addition for your digital bookshelf inside Digly Library.`;
                return res.json({
                    ...mysqlBook,
                    id: mysqlBook.id, 
                    isbn: actualIsbn,
                    description: deskripsiPajangan
                });
            }
        }

        // Cadangan jika buku tidak terdaftar di MySQL
        try {
            const response = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`, {
                timeout: 3000
            });
            const bookData = response.data[`ISBN:${isbn}`];

            if (!bookData) throw new Error("Buku tidak ditemukan di API");

            let deskripsiOtomatis = "Tidak ada deskripsi untuk buku ini.";
            if (bookData.description) {
                deskripsiOtomatis = typeof bookData.description === 'object' ? bookData.description.value : bookData.description;
            }

            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            return res.json({
                id: isbn,
                title: bookData.title,
                author: bookData.authors ? bookData.authors[0].name : 'Unknown Author',
                category: 'General',
                stock: 0,
                description: deskripsiOtomatis,
                cover_image: bookData.cover ? bookData.cover.large : `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
            });

        } catch (error) {
            return res.status(404).json({ message: "Buku tidak ditemukan di sistem online maupun lokal" });
        }
    });
});

module.exports = router;