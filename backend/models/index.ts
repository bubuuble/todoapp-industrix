import { Sequelize } from 'sequelize';
import { CategoryFactory } from './Category';
import { TodoFactory } from './Todo';
import configJson from '../config/config.json';

const env = process.env.NODE_ENV || 'development';
const rawConfig = (configJson as any)[env];
const config = {
  ...rawConfig,
  username: process.env.DB_USER || rawConfig.username,
  password: process.env.DB_PASS || rawConfig.password,
  database: process.env.DB_NAME || rawConfig.database,
  host: process.env.DB_HOST || rawConfig.host,
};

let sequelize: Sequelize;

if (process.env[config.use_env_variable as string]) {
  sequelize = new Sequelize(process.env[config.use_env_variable as string] as string, config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const db = {
  sequelize,
  Sequelize,
  Category: CategoryFactory(sequelize),
  Todo: TodoFactory(sequelize),
};

// Setup Associations (Relasi Antar Tabel)
// Category hasMany Todos
db.Category.hasMany(db.Todo, { foreignKey: 'category_id', as: 'todos' });
// Todo belongsTo Category
db.Todo.belongsTo(db.Category, { foreignKey: 'category_id', as: 'category' });

export default db;