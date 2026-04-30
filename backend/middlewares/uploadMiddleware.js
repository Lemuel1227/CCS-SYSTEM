// Simple middleware to extract file name from request body
// Files are no longer saved to disk - only the name is stored

const medicalUpload = {
  single: (fieldName) => {
    return (req, res, next) => {
      // Extract file name from request body instead of uploading file
      const fileName = req.body[fieldName] || req.body.fileName;
      if (fileName) {
        req.file = {
          originalname: fileName,
          filename: fileName,
          path: "",
          mimetype: "",
          size: 0
        };
      }
      next();
    };
  }
};

const announcementUpload = {
  single: (fieldName) => {
    return (req, res, next) => {
      // Extract file name from request body instead of uploading file
      const fileName = req.body[fieldName] || req.body.image || req.body.fileName;
      if (fileName) {
        req.file = {
          filename: fileName,
          path: fileName
        };
      }
      next();
    };
  }
};

module.exports = {
  medicalUpload,
  announcementUpload
};
