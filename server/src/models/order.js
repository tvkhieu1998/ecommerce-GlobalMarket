import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order.belongsTo(models.User, { foreignKey: "userId" });
      Order.belongsToMany(models.Product, {
        through: "OrderDetail",
        foreignKey: "orderId",
      });
      Order.hasMany(models.OrderDetail, { foreignKey: "orderId" });
      Order.hasMany(models.Payment, { foreignKey: "orderId", as: "payments" });
    }
  }
  Order.init(
    {
      orderNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "Pending",
          "Processing",
          "Shipped",
          "Delivered",
          "Cancelled"
        ),
        allowNull: false,
        defaultValue: "Pending",
      },
      paymentStatus: {
        type: DataTypes.ENUM("Pending", "Paid", "Failed", "Refunded"),
        allowNull: false,
        defaultValue: "Pending",
      },
      totalAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      shippingFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      discount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      finalAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      shippingFullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      shippingAddressLine: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      shippingPhoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Order",
    }
  );
  return Order;
};
