import { Model, DataTypes, Sequelize } from 'sequelize';

interface TodoAttributes {
  id?: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: string;
  due_date?: Date;
  category_id?: null;
}

export class Todo extends Model<TodoAttributes> implements TodoAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public completed!: boolean;
  public priority!: string;
  public due_date!: Date;
  public category_id!: null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const TodoFactory = (sequelize: Sequelize) => {
  Todo.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      priority: {
        type: DataTypes.STRING, 
        defaultValue: 'medium',
      },
      due_date: {
        type: DataTypes.DATE,
      },
      category_id: {
        type: DataTypes.INTEGER,
      }
    },
    {
      sequelize,
      tableName: 'Todos',
    }
  );
  return Todo;
};