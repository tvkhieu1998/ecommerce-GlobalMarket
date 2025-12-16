import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class CartItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CartItem.belongsTo(models.User, { foreignKey: "userId" });
      CartItem.belongsTo(models.ProductVariant, { foreignKey: "productVariantId", as: "variant" });
    }
  }
  CartItem.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      productVariantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "ProductVariants",
          key: "id",
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1,
        },
      }
    },
    {
      sequelize,
      modelName: "CartItem",
      indexes: [
        {
          unique: true,
          fields: ["userId", "productVariantId"],
        },
      ],
    }
  );

  return CartItem;
};
