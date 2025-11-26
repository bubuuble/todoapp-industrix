import { Model, DataTypes, Sequelize } from 'sequelize';

interface CategoryAttributes {
  id?: number;
  name: string;
  color: string;
}

export class Category extends Model<CategoryAttributes> implements CategoryAttributes {
  public id!: number;
  public name!: string;
  public color!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const CategoryFactory = (sequelize: Sequelize) => {
  Category.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      color: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'Categories',
    }
  );
  return Category;
};