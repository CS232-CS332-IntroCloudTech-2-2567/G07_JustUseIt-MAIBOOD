import express from 'express';
import pool from '../util/db.js';
import AuthMiddleware from '../util/AuthMiddleware.js';
import { uploadToS3 } from './imageUpload.js';
import upload from '../util/multer.js';
import deleteFromS3 from '../util/deleteS3.js';


const router = express.Router();


// Update profile endpoint
router.patch('/api/edit-profile', AuthMiddleware, upload.single('pic'), async (req, res) => {
    console.log('Full request body:', req.body);
    console.log('File:', req.file);
    
    const { fname, lname, zip_code, address, line, ig } = req.body;
    const pic = req.file;
    const userId = req.userID;
    let imageUrl;
    let connection;
    
    try {
        connection = await pool.getConnection();
        
        // First, get the current user data to check for existing image
        const [currentUser] = await connection.execute(
            'SELECT pic FROM members WHERE id = ?',
            [userId]
        );
        
        if (currentUser.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Handle image upload if present
        if (pic) {
            try {
                // Delete old image if it exists
                const oldImageUrl = currentUser[0].pic;
                if (oldImageUrl) {
                    await deleteFromS3(oldImageUrl);
                }

                // Upload new image
                imageUrl = await uploadToS3(pic);
            } catch (uploadError) {
                console.error('Error handling image:', uploadError);
                return res.status(500).json({ message: 'Error handling image upload/deletion' });
            }
        }
        
        // Build the update query dynamically
        let updateFields = [];
        let queryParams = [];
        
        if (fname !== undefined) {
            updateFields.push('fname = ?');
            queryParams.push(fname);
        }
        
        if (lname !== undefined) {
            updateFields.push('lname = ?');
            queryParams.push(lname);
        }
        
        if (zip_code !== undefined) {
            updateFields.push('zip_code = ?');
            queryParams.push(zip_code);
        }
        
        if (address !== undefined) {
            updateFields.push('address = ?');
            queryParams.push(address);
        }

        if (line !== undefined) {
            updateFields.push('line = ?');
            queryParams.push(line);
        }

        if (ig !== undefined) {
            updateFields.push('ig = ?');
            queryParams.push(ig);
        }

        // Only add pic to update if new image was uploaded
        if (imageUrl) {
            updateFields.push('pic = ?');
            queryParams.push(imageUrl);
        }
        
        // If no fields to update
        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }
        
        // Add userId to params
        queryParams.push(userId);
        
        // Execute the update
        const [result] = await connection.execute(
            `UPDATE members SET ${updateFields.join(', ')} WHERE id = ?`,
            queryParams
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found or no changes made' });
        }
        
        // Get updated user data to return
        const [updatedUser] = await connection.execute(
            'SELECT id, fname, lname, phone_number, zip_code, address, line, ig, pic FROM members WHERE id = ?',
            [userId]
        );
        
        return res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser[0]
        });
        
    } catch (error) {
        console.error('Profile update error:', error);
        return res.status(500).json({ message: 'Internal server error during profile update' });
    } finally {
        if (connection) {
            try {
                await connection.release();
            } catch (releaseError) {
                console.error('Error releasing database connection:', releaseError);
            }
        }
    }
});

export default router;

