const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('./logger');

class StorageProvider {
  constructor(type) {
    this.type = type || config.storage.type;
  }

  async upload(file, workspaceId) {
    switch (this.type) {
      case 'local':
        return this._uploadLocal(file, workspaceId);
      case 's3':
        return this._uploadS3(file, workspaceId);
      case 'r2':
        return this._uploadR2(file, workspaceId);
      case 'minio':
        return this._uploadMinio(file, workspaceId);
      default:
        return this._uploadLocal(file, workspaceId);
    }
  }

  async _uploadLocal(file, workspaceId) {
    const destDir = path.join(config.upload.dir, workspaceId.toString());
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    const destPath = path.join(destDir, file.filename);
    fs.renameSync(file.path, destPath);
    return {
      url: `/uploads/${workspaceId}/${file.filename}`,
      path: destPath,
    };
  }

  async _uploadS3(file) {
    logger.warn('S3 storage not fully configured');
    return { url: file.path, path: file.path };
  }

  async _uploadR2(file) {
    logger.warn('R2 storage not fully configured');
    return { url: file.path, path: file.path };
  }

  async _uploadMinio(file) {
    logger.warn('MinIO storage not fully configured');
    return { url: file.path, path: file.path };
  }

  async delete(url) {
    if (this.type === 'local') {
      const filePath = path.join(config.upload.dir, url.replace('/uploads/', ''));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  getPublicUrl(url) {
    if (url.startsWith('http')) return url;
    return `${config.frontendUrl}${url}`;
  }
}

module.exports = new StorageProvider();
