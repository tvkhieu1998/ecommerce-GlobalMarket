import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
    class OrderDetail extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            OrderDetail.belongsTo(models.Order, { foreignKey: 'orderId' });
            OrderDetail.belongsTo(models.ProductVariant, { foreignKey: 'productVariantId', as: 'variant' });
        }
    }
    OrderDetail.init({
        quantity: DataTypes.INTEGER,
        price: DataTypes.DECIMAL,
        total: DataTypes.DECIMAL
    }, {
        sequelize,
        modelName: 'OrderDetail',
    });
    return OrderDetail;
};