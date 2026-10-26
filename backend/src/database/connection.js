import { Sequelize } from 'sequelize';
import config from '../config/database.js';

const sequelize = new Sequelize(config.database, config.username, config.password, config);

export default sequelize;
