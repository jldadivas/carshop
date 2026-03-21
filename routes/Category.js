// CarShop/backend/routes/Category.js
const express = require('express');
const {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  softDeleteCategory,
  getDeletedCategories,
  restoreCategory,
  deleteCategory
} = require('../controllers/Category');

const { isAuthenticatedUser, isAdmin } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/categories', getAllCategories);
router.get('/categories/:id', getCategory);

// Admin routes
router.get('/admin/categories/trash', isAuthenticatedUser, isAdmin, getDeletedCategories);
router.get('/admin/categories/:id', isAuthenticatedUser, isAdmin, getCategory);
router.patch('/admin/categories/restore/:id', isAuthenticatedUser, isAdmin, restoreCategory);
router.post('/admin/categories', isAuthenticatedUser, isAdmin, createCategory);
router.put('/admin/categories/:id', isAuthenticatedUser, isAdmin, updateCategory);
router.delete('/admin/categories/:id', isAuthenticatedUser, isAdmin, softDeleteCategory);
router.delete('/admin/categories/delete/:id', isAuthenticatedUser, isAdmin, deleteCategory);

module.exports = router;
