const fs = require('fs');
const path = require('path');

class LocalStorageService {
    constructor() {
        this.primaryPath = '/home/ubuntu/Auction/backend/public/uploads/codeshare';
        this.fallbackPath = path.join(__dirname, '../public/uploads/codeshare');
    }

    /**
     * Get the appropriate upload path based on availability
     * @returns {string} The path to use for uploads
     */
    getUploadPath() {
        try {
            // Check if we are on a system where the primary path is viable
            // We check the base path '/home/ubuntu' to avoid creating deep directories on incompatible systems
            if (fs.existsSync('/home/ubuntu')) {
                if (!fs.existsSync(this.primaryPath)) {
                    fs.mkdirSync(this.primaryPath, { recursive: true });
                }
                return this.primaryPath;
            }
        } catch (err) {
            console.error('LocalStorageService: Error checking primary path:', err);
        }

        // Fallback to project relative path
        try {
            if (!fs.existsSync(this.fallbackPath)) {
                fs.mkdirSync(this.fallbackPath, { recursive: true });
            }
            return this.fallbackPath;
        } catch (err) {
            console.error('LocalStorageService: Error creating fallback path:', err);
            throw new Error('Failed to initialize local storage path');
        }
    }

    /**
     * Upload a file to local disk
     * @param {Buffer} fileBuffer - File content
     * @param {string} fileName - Original file name
     * @returns {Promise<Object>} File metadata
     */
    async uploadFile(fileBuffer, fileName) {
        try {
            const uploadDir = this.getUploadPath();
            const uniqueName = `${Date.now()}_${fileName.replace(/\s+/g, '-')}`;
            const filePath = path.join(uploadDir, uniqueName);

            fs.writeFileSync(filePath, fileBuffer);

            // Calculate relative URL for preview/access
            // The 'public' directory is served at root
            const url = `/uploads/codeshare/${uniqueName}`;

            return {
                fileName: uniqueName,
                filePath: filePath,
                url: url,
                size: fileBuffer.length
            };
        } catch (error) {
            console.error('LocalStorageService: Upload error:', error);
            throw error;
        }
    }

    /**
     * Delete a file from local disk
     * @param {string} filePath - Absolute path to the file
     * @returns {Promise<boolean>} Success status
     */
    async deleteFile(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                return true;
            }
            return false;
        } catch (error) {
            console.error('LocalStorageService: Delete error:', error);
            return false;
        }
    }
}

module.exports = new LocalStorageService();
