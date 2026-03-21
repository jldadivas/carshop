// CarShop/backend/controllers/Category.js
const Category = require('../models/Category');
const Product = require('../models/Product');

// Create new category   =>  /api/v1/admin/categories
exports.createCategory = async (req, res, next) => {
    try {
        console.log('🆕 Creating new category...');
        
        const categoryData = {
            name: req.body.name,
        };

        const category = await Category.create(categoryData);

        res.status(201).json({
            success: true,
            category
        });
    } catch (error) {
        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `${field} already exists`
            });
        }
        
        console.error('❌ CREATE CATEGORY ERROR:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all categories   =>  /api/v1/categories
exports.getAllCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({ isActive: true });

        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get single category details   =>  /api/v1/categories/:id
exports.getCategory = async (req, res, next) => {
    try {
        const category = await Category.findOne({
            _id: req.params.id,
            isActive: true
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Get products associated with this category
        const products = await Product.find({
            category: req.params.id,
            isActive: true
        }).select('name price stock');

        res.status(200).json({
            success: true,
            category: {
                ...category.toObject(),
                products
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update category   =>  /api/v1/admin/categories/:id
exports.updateCategory = async (req, res, next) => {
    try {
        let updateData = {
            name: req.body.name,
        };

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            category
        });
    } catch (error) {
        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `${field} already exists`
            });
        }
        
        console.error('❌ UPDATE CATEGORY ERROR:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Soft delete category   =>  /api/v1/admin/categories/:id
exports.softDeleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get deleted categories   =>  /api/v1/admin/categories/trash
exports.getDeletedCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({ isActive: false });

        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Restore category   =>  /api/v1/admin/categories/restore/:id
exports.restoreCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { isActive: true },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category restored successfully',
            category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Permanently delete category   =>  /api/v1/admin/categories/delete/:id
exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Delete image from Cloudinary if it exists
        if (category.image && category.image.public_id) {
            try {
                await deleteFromCloudinary(category.image.public_id);
            } catch (err) {
                console.warn('Could not delete image from Cloudinary:', err.message);
            }
        }

        await Category.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Category permanently deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
