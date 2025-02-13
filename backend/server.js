const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// Add new QR code
app.post('/api/qrcodes', async (req, res) => {
    try {
        const { codeValue } = req.body;
        
        // Check if code exists
        const existingCode = await pool.query(
            'SELECT * FROM scanned_codes WHERE code_value = $1',
            [codeValue]
        );
        
        if (existingCode.rows.length > 0) {
            return res.json({ exists: true, code: existingCode.rows[0] });
        }
        
        // Insert new code
        const newCode = await pool.query(
            'INSERT INTO scanned_codes (code_value) VALUES ($1) RETURNING *',
            [codeValue]
        );
        
        res.json({ exists: false, code: newCode.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get all QR codes
app.get('/api/qrcodes', async (req, res) => {
    try {
        const allCodes = await pool.query(
            'SELECT * FROM scanned_codes ORDER BY scan_date DESC'
        );
        res.json(allCodes.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.listen(5000, () => {
    console.log('Server running on port 5000');
});