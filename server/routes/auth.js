import express from 'express'
import pool from '../util/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const router = express.Router();

const SALTROUNDS = 10;
const SECRET_KEY = process.env.TOKEN;
if (!SECRET_KEY) {
    console.error("FATAL ERROR: TOKEN environment variable is not set.");
}


// Register
router.post('/register', async (req, res) => {
    const { fname, lname, phone_number, password } = req.body;

    if (!fname || !lname || !phone_number || !password) {
        return res.status(400).json({ message: 'Please provide name, email, and password' });
    }


    let connection;
    try {
        connection = await pool.getConnection();

        // Check exist user
        const [existingUsers] = await connection.execute(
            'SELECT id FROM members WHERE phone_number = ? LIMIT 1',
            [phone_number]
        );
        if (existingUsers.length > 0) {
            console.log('User with this email already exists')
            return res.status(409).json({ message: 'User with this email already exists' });
        }


        const hashedPassword = await bcrypt.hash(password, SALTROUNDS);

        const [result] = await connection.execute(
            'INSERT INTO members (fname, lname, phone_number, password) VALUES (?, ?, ?, ?)',
            [fname, lname, phone_number, hashedPassword]
        );

        res.status(201).json({
            message: 'User registered successfully',
            result
        });

    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error during registration' });
    }
    // finally {
    //     if (connection) {
    //         try {
    //             await connection.release();
    //             console.log("Database connection released.")
    //         } catch (releaseError) {
    //             console.error('Error releasing database connection:', releaseError);
    //         }
    //     }
    // }
})


// Login
router.post('/login', async (req, res) => {
    const { phone_number, password } = req.body;
    if (!phone_number || !password) {
        return res.status(400).json({ message: 'Please provide phone_number and password' });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        const [rows] = await connection.execute(
            'SELECT * FROM members WHERE phone_number = ?',
            [phone_number]
        );

        if (rows.length === 0) {
            console.log('Invalid email or password')
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = rows[0];

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const {password: passwordHash , ...rest} = user;

        const token = jwt.sign({ userId: user.id }, SECRET_KEY);

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'None',
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        return res.status(200).json({
            message: 'Login successful', rest
        });
    }
    catch (error) {
        console.error('Login error:', error);
    }
})


// auth
router.get('/authentication', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.sendStatus(401);

    try {
        const user = jwt.verify(token, SECRET_KEY);
        res.json({ message: `authentication confirm`, user });
    } catch (err) {
        res.sendStatus(403);
    }
});


// Logout
router.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});





export default router