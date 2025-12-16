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
      Product.hasMany(models.ProductVariant, {foreignKey: "productId", as: "variants"});
      Product.hasMany(models.Image, { foreignKey: "productId", as:  "gallery" });

      Product.belongsTo(models.Category, { foreignKey: "categoryId" , as: "category"});
      Product.hasMany(models.Review, { foreignKey: "productId" , as: "reviews"});
      Product.belongsToMany(models.Tag, {
        through: "ProductTag",
        foreignKey: "productId",
        otherKey: "tagId",
        as: "tags"
      });
    }
  }
  Product.init(
    {
      name: DataTypes.STRING,
      slug: {
        type: DataTypes.STRING,
        unique:true
      },
      imagePath: DataTypes.STRING,
      summary: DataTypes.TEXT,
      description: DataTypes.TEXT,
      stars: {
        type: DataTypes.DECIMAL (3, 2), //tong 3 chu so hien thi va co 2 so sau dau phay
        defaultValue: 0
      },
      reviewCount: {
        type:DataTypes.INTEGER,
        defaultValue: 0
      },
      //An sp tam thoi khi het hang ton kho, hay tam ngung ban
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      categoryId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Product",
      //set index de tim kiem nhanh hon
      indexes:[{
        unique: true,
        fields: ['slug']
      }]
    }
  );
  return Product;
};
