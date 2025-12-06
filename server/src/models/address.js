import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Address extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Address.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  Address.init(
    {
      userId: DataTypes.INTEGER,
      fullName: DataTypes.STRING,
      phoneNumber: DataTypes.STRING,
      addressLine: DataTypes.TEXT,
      isDefault: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Address",
    }
  );
  return Address;
};
