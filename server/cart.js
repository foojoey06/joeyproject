const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Cart = sequelize.define('cart', {
  cartid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  userid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user',
      key: 'id'
    }
  },
  productid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'product',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'cart',
  timestamps: false
});

module.exports = Cart;
