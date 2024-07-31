const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const slugify = require('slugify');

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.SECRET_KEY
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: 'artbyart',
      resource_type: isVideo ? 'video' : 'image',
      format: isVideo ? 'mp4' : 'jpg'
    };
  }
});

const upload = multer({ storage });

// GET product by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Error fetching product' });
  }
});

// DELETE product by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { imageId, videoId } = req.body;
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (imageId) {
      await cloudinary.uploader.destroy(imageId);
    }

    if (videoId) {
      await cloudinary.uploader.destroy(videoId, { resource_type: 'video' });
    }

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Error deleting product' });
  }
});

// UPDATE product by ID
router.put('/:id', upload.fields([{ name: 'images', maxCount: 5 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
  const { id } = req.params;
  const { title, category, price, description, available, procedures } = req.body;
  const imageURLs = req.files.images ? req.files.images.map(file => file.path) : [];
  const videoURL = req.files.video ? req.files.video[0].path : null;

  const updatedData = {
    title,
    category,
    price,
    description,
    available: available === 'true',
    procedures: procedures ? procedures.split(',').map(proc => proc.trim()) : []
  };

  if (imageURLs.length > 0) {
    updatedData.images = imageURLs;
  }
  if (videoURL) {
    updatedData.video = videoURL;
  }
  if (title) {
    updatedData.slug = slugify(title);
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ success: true, message: 'Product updated successfully', updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Error updating product' });
  }
});

module.exports = router;
