import { Request, Response } from 'express';
import db from '../../models';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await db.Category.findAll({
      order: [['name', 'ASC']]
    });

    res.json({ 
      success: true, 
      data: categories 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching categories', 
      error: (error as Error).message 
    });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await db.Category.findByPk(id, {
      include: [{ 
        model: db.Todo, 
        as: 'todos',
        attributes: ['id', 'title', 'completed']
      }]
    });

    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching category', 
      error: (error as Error).message 
    });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, color } = req.body;

    const existingCategory = await db.Category.findOne({ where: { name } });
    
    if (existingCategory) {
      return res.status(400).json({ 
        success: false, 
        message: 'Category already exists' 
      });
    }

    const category = await db.Category.create({
      name,
      color: color || '#1890ff'
    });

    res.status(201).json({ 
      success: true, 
      data: category,
      message: 'Category created successfully'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Error creating category', 
      error: (error as Error).message 
    });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    const category = await db.Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }

    if (name && name !== category.name) {
      const existingCategory = await db.Category.findOne({ where: { name } });
      if (existingCategory) {
        return res.status(400).json({ 
          success: false, 
          message: 'Category name already exists' 
        });
      }
    }

    await category.update({
      name: name || category.name,
      color: color || category.color
    });

    res.json({ 
      success: true, 
      data: category,
      message: 'Category updated successfully'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Error updating category', 
      error: (error as Error).message 
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await db.Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }

    // Set todos with this category to null instead of blocking deletion
    await db.Todo.update(
      { category_id: null },
      { where: { category_id: id } }
    );

    await category.destroy();

    res.json({ 
      success: true, 
      message: 'Category deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting category', 
      error: (error as Error).message 
    });
  }
};
