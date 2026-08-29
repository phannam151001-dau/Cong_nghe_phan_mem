const express = require("express");
const mariadb = require("mariadb");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const pool = mariadb.createPool({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "0828937914n",
    database: "san_co_pro"
});

app.get("/api/test", async (req, res) => {
    try {
        const rows = await pool.query("SELECT 1 AS test");
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Không kết nối được database"
        });
    }
});

app.listen(3000, () => {
    console.log("Backend chạy tại http://localhost:3000");
});
