import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
    class Inventory extends Model {
        static associate(models) {
            Inventory.belongsTo(models.ProductVariant, {foreignKey: "productVariantId", as: "variant"})
        }
    }
    Inventory.init ({
        productVariantId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true, //dam bao 1 variant co duy nhat 1 dong inventory
            references: {model: "ProductVariants", key: "id"}
        },
        //so luong hang thuc te con trong kho
        quantity:{
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {min: 0}
        },
        //so luong hang dang cho thanh toan
        reservedQuantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {min: 0}
        },
        //Luu vi tri de hang => Huu ich cho viec mo rong: 
        // + Tao mot ung dung quan ly kho hang ma su dung chung 1 db.
        shelfLocation: DataTypes.STRING,
        //Trigger nhap hang
        lowStockThreshold: {
            type: DataTypes.INTEGER,
            defaultValue: 10,
        }
    }, {
        sequelize,
        modelName: "Inventory",
        indexes: [{
            unique: true,
            fields: ['productVariantId']
        }]
    });
    return Inventory;
}