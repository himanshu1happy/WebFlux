const fs = require("fs");

const validateFileContent = (req, res, next) => {
  // Check if files exist (handles both upload.single and upload.array)
  const files = [];
  if (req.file) files.push(req.file);
  if (req.files) files.push(...req.files);

  if (files.length === 0) return next();

  for (const file of files) {
    try {
      // Read the first 4 bytes of the file
      const buffer = Buffer.alloc(4);
      const fd = fs.openSync(file.path, "r");
      fs.readSync(fd, buffer, 0, 4, 0);
      fs.closeSync(fd);

      // Convert buffer to hex string
      const hex = buffer.toString("hex").toUpperCase();

      // Magic Numbers
      const isJPEG = hex.startsWith("FFD8FF");
      const isPNG = hex.startsWith("89504E47");
      const isPDF = hex.startsWith("25504446");

      if (!isJPEG && !isPNG && !isPDF) {
        // Delete the malicious file immediately
        fs.unlinkSync(file.path);
        return res.status(400).json({
          success: false,
          message: "Security Error: File content does not match allowed types.",
        });
      }
    } catch (error) {
      console.error("File validation error:", error);
      // Clean up on read failure
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(500).json({
        success: false,
        message: "Server error validating file content.",
      });
    }
  }

  next();
};

module.exports = validateFileContent;