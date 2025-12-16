import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
    class ProductVariant extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            ProductVariant.belongsTo(models.Product, {foreignKey: "productId", as: "product"});
            ProductVariant.hasMany(models.CartItem, {foreignKey: "productVariantId"});
            //Link toi bang ton kho
            ProductVariant.hasOne(models.Inventory, {foreignKey: "productVariantId", as: "inventory"});
            ProductVariant.belongsToMany(models.Order, {
                through: "OrderDetail",
                foreignKey: "productVariantId",
                otherKey: "orderId"
            })
        }
    }
    ProductVariant.init({
        productId: DataTypes.INTEGER,
        sku: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        price: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false
        },
        //Hien thi gia goc co gach ngang khi co giam gia
        originalPrice:  DataTypes.DECIMAL(10, 2),
        //Dinh danh bien the de luu size, color 
        options: {
            type: DataTypes.JSONB,
            defaultValue: {}
        },
        imagePath: DataTypes.STRING, //anh rieng cho tung bien the
    }, {
        sequelize,
        modelName: "ProductVariant"
    }
    );
    return ProductVariant;
}