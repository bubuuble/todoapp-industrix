import { Request, Response, NextFunction } from 'express';

export const validateTodo = (req: Request, res: Response, next: NextFunction) => {
  const { title, category_id, priority } = req.body;
  const errors: string[] = [];

  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (title && title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (priority && !['low', 'medium', 'high'].includes(priority)) {
    errors.push('Priority must be low, medium, or high');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed', 
      errors 
    });
  }

  next();
};

export const validateCategory = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body;
  const errors: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push('Category name is required');
  }

  if (name && name.length > 50) {
    errors.push('Category name must be less than 50 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed', 
      errors 
    });
  }

  next();
};
