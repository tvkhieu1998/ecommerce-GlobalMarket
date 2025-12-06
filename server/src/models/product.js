import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product.hasMany(models.Image, { foreignKey: "productId" });
      Product.hasMany(models.CartItem, { foreignKey: "productId" });

      Product.belongsTo(models.Category, { foreignKey: "categoryId" });

      Product.belongsToMany(models.Tag, {
        through: "ProductTag",
        foreignKey: "productId",
        otherKey: "tagId",
      });

      Product.belongsToMany(models.Order, {
        through: "OrderDetail",
        foreignKey: "productId",
        otherKey: "orderId",
      });

      Product.hasMany(models.Review, { foreignKey: "productId" });
    }
  }
  Product.init(
    {
      name: DataTypes.STRING,
      imagePath: DataTypes.STRING,
      price: DataTypes.DECIMAL,
      summary: DataTypes.TEXT,
      description: DataTypes.TEXT,
      stars: DataTypes.DECIMAL,
      reviewCount: DataTypes.INTEGER,
      categoryId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Product",
    }
  );
  return Product;
};
