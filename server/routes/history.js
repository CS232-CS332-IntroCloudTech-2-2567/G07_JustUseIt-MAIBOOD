import express from 'express'

import AuthMiddleware from '../util/AuthMiddleware.js'
import pool from '../util/db.js'


const router = express.Router()


// Get All History
router.get('/api/history', AuthMiddleware, async (req, res) => {
    try {
        const userID = req.userID

        const [rows] = await pool.query(
            'SELECT * FROM fridge WHERE owner = ? AND (is_store = 2 OR is_store = 3 OR is_store = 4)',
            [userID]
        )

        const [givenCount] = await pool.query(
            'SELECT COUNT(*) as count FROM fridge WHERE owner = ? AND is_store = 3',
            [userID]
        )
        
        const [expiredCount] = await pool.query(
            'SELECT COUNT(*) as count FROM fridge WHERE owner = ? AND is_store = 4',
            [userID]
        )

        const [eatCount] = await pool.query(
            'SELECT COUNT(*) as count FROM fridge WHERE owner = ? AND is_store = 2',
            [userID]
        )

        res.status(200).json({
            history: rows,
            givenCount: givenCount[0].count,
            expiredCount: expiredCount[0].count,
            eatCount: eatCount[0].count
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})




export default router