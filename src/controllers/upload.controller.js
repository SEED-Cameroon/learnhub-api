import multer from "multer";

// The cloudinary SDK validates CLOUDINARY_URL as soon as it is imported and
// throws if it is malformed, so it is loaded on first upload: a bad value
// then breaks uploads (with a clear 503) instead of crashing the whole API.
let cloudinaryPromise;
async function getCloudinary() {
  cloudinaryPromise ??= import("cloudinary").then((m) => m.v2);
  return cloudinaryPromise;
}
const IMAGE_MAX = 2 * 1024 * 1024;
const VIDEO_MAX = 100 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

function uploader(types, maxBytes) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxBytes, files: 1 },
    fileFilter: (req, file, cb) => {
      if (types.includes(file.mimetype)) return cb(null, true);
      const err = new Error(`Unsupported file type. Use ${types.map((t) => t.split("/")[1]).join(", ")}.`);
      err.statusCode = 415;
      cb(err);
    },
  }).single("file");
}

export const receiveImage = uploader(IMAGE_TYPES, IMAGE_MAX);
export const receiveVideo = uploader(VIDEO_TYPES, VIDEO_MAX);

async function toCloudinary(buffer, options) {
  const cloudinary = await getCloudinary();
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(options, (err, result) => (err ? reject(err) : resolve(result))).end(buffer);
  });
}

function makeHandler(resourceType) {
  return async function upload(req, res, next) {
    try {
      if (!process.env.CLOUDINARY_URL) {
        return res.status(503).json({ success: false, message: "Uploads aren't configured on this server" });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Send the file in a "file" form field' });
      }

      let result;
      try {
        result = await toCloudinary(req.file.buffer, {
          resource_type: resourceType,
          folder: `learnhub/${resourceType}s/${req.user.sub}`,
          // Mobile and satellite links to Cloudinary can be slow; allow up to 2 minutes.
          timeout: 120000,
        });
      } catch (err) {
        console.error("Cloudinary upload failed:", err.message);
        cloudinaryPromise = undefined; // retry the import next time, e.g. after the env is fixed
        return res.status(503).json({ success: false, message: "The upload service isn't available right now. Try again later." });
      }

      return res.status(201).json({
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          duration: result.duration,
        },
        message: "File uploaded successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export const uploadImage = makeHandler("image");
export const uploadVideo = makeHandler("video");
