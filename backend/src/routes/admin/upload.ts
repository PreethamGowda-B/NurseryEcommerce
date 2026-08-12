import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireAdmin } from '../../middleware/requireAdmin.js';
import { sendSuccess } from '../../utils/response.js';
import { BadRequestError } from '../../utils/errors.js';

const router = Router();
router.use(authenticate, requireAdmin);

// Multer — keep file in memory (max 5MB, images only)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

/**
 * POST /api/admin/upload
 * Upload a product image to Supabase Storage
 */
router.post(
  '/admin/upload',
  upload.single('image'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new BadRequestError('No image file provided');
      }

      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new BadRequestError('Storage not configured. Add SUPABASE_URL and SUPABASE_SERVICE_KEY env vars.');
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      // Unique filename: timestamp + original name, sanitised
      const ext = req.file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
      const safeName = req.file.originalname
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9-_]/g, '-')
        .slice(0, 40);
      const filename = `products/${Date.now()}-${safeName}.${ext}`;

      const { error } = await supabase.storage
        .from('product-images')
        .upload(filename, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (error) {
        throw new BadRequestError(`Storage upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filename);

      sendSuccess(res, { url: publicData.publicUrl }, 'Image uploaded successfully');
    } catch (err) {
      next(err);
    }
  }
);

export default router;
