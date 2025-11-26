import { Request, Response } from 'express';
import db from '../../models';
import { Op } from 'sequelize';

export const getTodos = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      category, 
      priority, 
      completed 
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const where: any = {};

    // Search filter
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Category filter
    if (category) {
      where.category_id = category;
    }

    // Priority filter
    if (priority) {
      where.priority = priority;
    }

    // Completed status filter
    if (completed !== undefined) {
      where.completed = completed === 'true';
    }

    const { count, rows } = await db.Todo.findAndCountAll({
      where,
      include: [{ 
        model: db.Category, 
        as: 'category',
        attributes: ['id', 'name', 'color']
      }],
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        current_page: Number(page),
        per_page: Number(limit),
        total_pages: Math.ceil(count / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching todos', 
      error: (error as Error).message 
    });
  }
};

export const getTodoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const todo = await db.Todo.findByPk(id, {
      include: [{ 
        model: db.Category, 
        as: 'category',
        attributes: ['id', 'name', 'color']
      }]
    });

    if (!todo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Todo not found' 
      });
    }

    res.json({ success: true, data: todo });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching todo', 
      error: (error as Error).message 
    });
  }
};

export const createTodo = async (req: Request, res: Response) => {
  try {
    const { title, description, category_id, priority, due_date } = req.body;

    const todo = await db.Todo.create({
      title,
      description,
      category_id,
      priority: priority || 'medium',
      due_date: due_date || null,
      completed: false
    });

    const newTodo = await db.Todo.findByPk(todo.id, {
      include: [{ 
        model: db.Category, 
        as: 'category',
        attributes: ['id', 'name', 'color']
      }]
    });

    res.status(201).json({ 
      success: true, 
      data: newTodo,
      message: 'Todo created successfully'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Error creating todo', 
      error: (error as Error).message 
    });
  }
};

export const updateTodo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, category_id, priority, due_date, completed } = req.body;

    const todo = await db.Todo.findByPk(id);

    if (!todo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Todo not found' 
      });
    }

    await todo.update({
      title: title !== undefined ? title : todo.title,
      description: description !== undefined ? description : todo.description,
      category_id: category_id !== undefined ? category_id : todo.category_id,
      priority: priority !== undefined ? priority : todo.priority,
      due_date: due_date !== undefined ? due_date : todo.due_date,
      completed: completed !== undefined ? completed : todo.completed
    });

    const updatedTodo = await db.Todo.findByPk(id, {
      include: [{ 
        model: db.Category, 
        as: 'category',
        attributes: ['id', 'name', 'color']
      }]
    });

    res.json({ 
      success: true, 
      data: updatedTodo,
      message: 'Todo updated successfully'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Error updating todo', 
      error: (error as Error).message 
    });
  }
};

export const deleteTodo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const todo = await db.Todo.findByPk(id);

    if (!todo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Todo not found' 
      });
    }

    await todo.destroy();

    res.json({ 
      success: true, 
      message: 'Todo deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting todo', 
      error: (error as Error).message 
    });
  }
};

export const toggleTodoComplete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const todo = await db.Todo.findByPk(id);

    if (!todo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Todo not found' 
      });
    }

    await todo.update({ completed: !todo.completed });

    const updatedTodo = await db.Todo.findByPk(id, {
      include: [{ 
        model: db.Category, 
        as: 'category',
        attributes: ['id', 'name', 'color']
      }]
    });

    res.json({ 
      success: true, 
      data: updatedTodo,
      message: 'Todo status updated successfully'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Error updating todo status', 
      error: (error as Error).message 
    });
  }
};
