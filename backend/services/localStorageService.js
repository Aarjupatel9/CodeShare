const fs = require('fs');
const path = require('path');
const logger = require('../utils/loggerUtility');

class LocalStorageService {
    constructor() {
        // Prefer an environment variable so path is not hardcoded per machine.
        // Falls back to the legacy absolute path for backward compatibility.
        this.primaryPath = process.env.LOCAL_UPLOAD_PATH || '/home/ubuntu/Auction/backend/public/uploads/codeshare';
        this.fallbackPath = path.join(__dirname, '../public/uploads/codeshare');
        this._resolvedUploadPath = null; // Lazy, cached after first resolution
    }

    /**
     * Get the appropriate upload path based on availability.
     * Resolves once and caches the result. Does NOT throw at module-load time.
     * @returns {string} The absolute path to use for uploads
     */
    getUploadPath() {
        if (this._resolvedUploadPath) {
            return this._resolvedUploadPath;
        }

        // Try primary path
        try {
            const primaryBase = path.dirname(this.primaryPath).split(path.sep)[1]; // e.g. 'home'
            if (fs.existsSync('/' + primaryBase)) {
                if (!fs.existsSync(this.primaryPath)) {
                    fs.mkdirSync(this.primaryPath, { recursive: true });
                }
                this._resolvedUploadPath = this.primaryPath;
                return this._resolvedUploadPath;
            }
        } catch (err) {
            console.error('LocalStorageService: Error checking primary path:', err.message);
        }

        // Fall back to project-relative path
        try {
            if (!fs.existsSync(this.fallbackPath)) {
                fs.mkdirSync(this.fallbackPath, { recursive: true });
            }
            this._resolvedUploadPath = this.fallbackPath;
            return this._resolvedUploadPath;
        } catch (err) {
            // Do not crash the process — defer error to upload time
            console.error('LocalStorageService: Error creating fallback path:', err.message);
            throw new Error('Failed to initialize local storage path: ' + err.message);
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

            // Async write — does not block the event loop
            await fs.promises.writeFile(filePath, fileBuffer);

            const url = `/uploads/codeshare/${uniqueName}`;

            return {
                fileName: uniqueName,
                filePath: filePath,
                url: url,
                size: fileBuffer.length
            };
        } catch (error) {
            console.error('LocalStorageService: Upload error:', error.message);
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
                await fs.promises.unlink(filePath);
                return true;
            }
            return false;
        } catch (error) {
            console.error('LocalStorageService: Delete error:', error.message);
            return false;
        }
    }
}

module.exports = new LocalStorageService();
