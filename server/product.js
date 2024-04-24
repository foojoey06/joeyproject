const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Product = sequelize.define('product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  des: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  img: {
    type: DataTypes.BLOB,
    allowNull: false
  }
}, {
  tableName: 'product',
  timestamps: false
});

module.exports = Product;
