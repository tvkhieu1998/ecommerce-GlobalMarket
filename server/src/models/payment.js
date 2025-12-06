import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      // Associations
      Payment.belongsTo(models.Order, {
        foreignKey: "orderId",
        as: "order",
      });

      Payment.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }

    // Instance methods
    isSuccessful() {
      return this.paymentStatus === "SUCCESS";
    }

    isPending() {
      return this.paymentStatus === "PENDING";
    }

    isFailed() {
      return this.paymentStatus === "FAILED";
    }

    // Static methods
    static async createPayment(orderData, paymentData) {
      const transaction = await sequelize.transaction();

      try {
        const payment = await this.create(
          {
            orderId: orderData.id,
            userId: orderData.userId,
            paymentMethod: paymentData.paymentMethod,
            paymentGateway: paymentData.paymentGateway,
            amount: orderData.finalAmount,
            currency: paymentData.currency || "VND",
            paymentStatus: "PENDING",
            gatewayData: paymentData.gatewayData || {},
            externalTransactionId: paymentData.externalTransactionId,
            description: `Payment for order #${orderData.id}`,
          },
          { transaction }
        );

        await transaction.commit();
        return payment;
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }

    static async updatePaymentStatus(paymentId, status, gatewayResponse = {}) {
      const payment = await this.findByPk(paymentId);
      if (!payment) {
        throw new Error("Payment not found");
      }

      await payment.update({
        paymentStatus: status,
        gatewayData: {
          ...payment.gatewayData,
          ...gatewayResponse,
        },
        ...(status === "SUCCESS" && { paidAt: new Date() }),
        ...(status === "FAILED" && { failureReason: gatewayResponse.error }),
      });

      return payment;
    }
  }

  Payment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Order ID is required" },
          isInt: { msg: "Order ID must be an integer" },
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "User ID is required" },
          isInt: { msg: "User ID must be an integer" },
        },
      },
      paymentMethod: {
        type: DataTypes.ENUM(
          "COD",
          "PAYPAL",
          "PAYOS",
          "BANK_TRANSFER",
          "CREDIT_CARD"
        ),
        allowNull: false,
        validate: {
          notNull: { msg: "Payment method is required" },
          isIn: {
            args: [["COD", "PAYPAL", "PAYOS", "BANK_TRANSFER", "CREDIT_CARD"]],
            msg: "Invalid payment method",
          },
        },
      },
      paymentGateway: {
        type: DataTypes.ENUM("INTERNAL", "PAYPAL", "PAYOS", "VNPAY", "MOMO"),
        allowNull: false,
        defaultValue: "INTERNAL",
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          notNull: { msg: "Payment amount is required" },
          min: { args: [0], msg: "Payment amount must be positive" },
        },
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: "VND",
        validate: {
          len: { args: [3, 3], msg: "Currency must be 3 characters" },
        },
      },
      paymentStatus: {
        type: DataTypes.ENUM("Pending", "Paid", "Failed", "Refunded"),
        allowNull: false,
        defaultValue: "Pending",
      },
      transactionId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
      },
      externalTransactionId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Transaction ID from payment gateway",
      },
      gatewayData: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Raw response data from payment gateway",
      },
      paidAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      refundedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      failureReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: "IP address of the user making payment",
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "User agent string for fraud detection",
      },
    },
    {
      sequelize,
      modelName: "Payment",
      tableName: "Payments",
      timestamps: true,
      indexes: [
        {
          fields: ["orderId"],
        },
        {
          fields: ["userId"],
        },
        {
          fields: ["paymentStatus"],
        },
        {
          fields: ["paymentMethod"],
        },
        {
          fields: ["transactionId"],
          unique: true,
        },
        {
          fields: ["createdAt"],
        },
      ],
    }
  );

  return Payment;
};
