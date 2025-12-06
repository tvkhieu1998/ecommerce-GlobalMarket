/* src/seeders/000-init-all-data.js */
'use strict'; 
const bcrypt = require("bcryptjs"); 
const dayjs = require("dayjs"); 
const { faker } = require("@faker-js/faker");

// Mật khẩu mặc định cho tất cả user
const password = bcrypt.hashSync("123456", 10);

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const range = (n, start = 1) => Array.from({ length: n }, (_, i) => i + start);
const money = (min, max) =>
  Number((Math.random() * (max - min) + min).toFixed(2));
const past = (days = 90) => {
  const end = new Date();
  const start = dayjs(end).subtract(days, "day").toDate();
  return new Date(start.getTime() + Math.random() * (end - start));
};
const sentence = () => {
  const words =
    "premium quality elegant durable stylish modern compact versatile smart eco friendly essential trendy portable classic pro edition".split(
      " "
    );
  const n = rand(6, 12);
  return (
    Array.from({ length: n }, () => words[rand(0, words.length - 1)])
      .join(" ")
      .replace(/^\w/, (c) => c.toUpperCase()) + "."
  );
};
const phoneVN = () => `0${rand(83000000, 98999999)}`;

// ===== Unsplash (ổn định) =====
const UNSPLASH_IDS = {
  shoes: [
    "1542291026-7eec264c27ff",
    "1549298916-b41d501d3772",
    "1491553895911-0055eca6402d",
    "1551107696-a4b0c5a0d9a2",
    "1539185441755-769473a23570",
    "1511556532299-8f662fc26c06",
    "1595341888016-a392ef81b7de",
    "1575537302964-96cd47c06b1b",
    "1491553895911-0055eca6402d",
  ],
  clothes: [
    "1564584217132-2271feaeb3c5",
    "1620799140408-edc6dcb6d633",
    "1556905055-8f358a7a47b2",
    "1479064555552-3ef4979f8908",
    "1529374255404-311a2a4f1fd9",
  ],
  perfume: [
    "1458538977777-0549b2370168",
    "1523293182086-7651a899d37f",
    "1593487568720-92097fb460fb",
    "1595425959632-34f2822322ce",
    "1506915925765-ed31516b9080",
  ],
  electronics: [
    "1611186871348-b1ce696e52c9",
    "1550009158-9ebf69173e03",
    "1611761226428-0a3ec16d2e78",
    "1517336714731-489689fd1ca8",
    "1523275335684-37898b6baf30",
  ],
  home: [
    "1484101403633-562f891dc89a",
    "1501045661006-fcebe0257c3f",
    "1503602642458-232111445657",
    "1597817109745-c418f4875230",
  ],
  food: [
    "1504674900247-0877df9cc836",
    "1496116218417-1a781b1c416c",
    "1518779578993-ec3579fee39f",
  ],
  portrait: [
    "1494790108377-be9c29b29330",
    "1547425260-76bcadfb4f2c",
    "1511367461989-f85a21fda167",
    "1580489944761-15a19d654956",
    "1438761681033-6461ffad8d80",
    "1507003211169-0a1dd7228f2c",
    "1623366302587-b38b1ddaefd9",
    "1633332755192-727a05c4013d",
    "1560250097-0b93528c311a",
    "1583195763986-0231686dcd43",
  ],
};
const unsplashFromGroup = (group, w = 1000, h = 750) => {
  const ids = UNSPLASH_IDS[group] || UNSPLASH_IDS.shoes;
  const id = ids[rand(0, ids.length - 1)];
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
};

// ===== Quy mô dữ liệu =====
const N_USERS = 50;
const N_TAGS = 20;
const N_PRODUCTS = 300;
const N_REVIEWS = 1000;
const N_CARTITEMS = 200;
const N_ORDERS = 100;

// --------- ✨ Helper: reset sequences cho Postgres ✨ ---------
function qIdent(name) {
  // quote identifier: Users -> "Users", có escape nếu có dấu "
  return `"${String(name).replace(/"/g, '""')}"`;
}

async function resetSeq(sequelize, table, t) {
  const tbl = qIdent(table);

  // 1) Lấy tên sequence (nếu có)
  const [rows] = await sequelize.query(
    `SELECT pg_get_serial_sequence('${tbl}', 'id')::text AS seq_name`,
    { transaction: t }
  );
  const seqName = rows?.[0]?.seq_name;

  if (!seqName) {
    // Bảng không có serial/identity cho cột id (vd: bảng join, PK tổng hợp, hoặc id không auto-increment)
    return;
  }

  // 2) Đặt sequence về MAX(id)+1
  await sequelize.query(
    `
    SELECT setval(
      '${seqName}',
      COALESCE((SELECT MAX("id") FROM ${tbl}), 0) + 1,
      false
    )
    `,
    { transaction: t }
  );
}

async function resetAllSeqs(sequelize, t) {
  // Liệt kê các bảng có cột id tự tăng trong schema của bạn
  const tables = [
    "Users",
    "Categories",
    "Tags",
    "Products",
    "Images",
    "Addresses",
    "CartItems",
    "Orders",
    "Payments",
    "Reviews",
    // Bảng không có cột id tự tăng (vd: OrderDetails, ProductTags) thì KHÔNG cần đưa vào
  ];
  for (const tb of tables) {
    await resetSeq(sequelize, tb, t);
  }
}

module.exports = {
  async up(queryInterface) {
    const trans = await queryInterface.sequelize.transaction();

    try {
      // 1) Users
      const users = range(N_USERS).map((id) => {
        const createdAt = past(365);
        const updatedAt = faker.date.between({
          from: createdAt,
          to: new Date(),
        });
        return {
          id,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: `user${id}@example.com`,
          password: password,
          phoneNumber: `0${rand(83000000, 98999999)}`,
          role: Math.random() < 0.97 ? "User" : "Admin",
          isActive: true,
          profileImage: unsplashFromGroup("portrait", 200, 200),
          createdAt,
          updatedAt,
        };
      });
      await queryInterface.bulkInsert("Users", users, { transaction: trans });

      // 2) Categories
      const catGroups = [
        "electronics",
        "shoes",
        "home",
        "clothes",
        "perfume",
        "food",
      ];
      const categories = range(catGroups.length).map((id) => ({
        id,
        name: catGroups[id - 1],
        createdAt: past(300),
        updatedAt: new Date(),
      }));
      await queryInterface.bulkInsert("Categories", categories, {
        transaction: trans,
      });

      // 3) Tags
      const tagPool = [
        "Hot",
        "New",
        "Sale",
        "Limited",
        "Eco",
        "Premium",
        "Budget",
        "Trending",
        "Best Seller",
        "Daily",
        "Gift",
        "Bundle",
        "Essential",
        "Office",
        "Home",
        "Outdoor",
        "Gadget",
        "Sport",
        "Kids",
        "Food",
      ];
      const tags = range(N_TAGS).map((id) => ({
        id,
        name: faker.helpers.arrayElement(tagPool) + " " + faker.word.noun(),
        createdAt: past(200),
        updatedAt: new Date(),
      }));
      await queryInterface.bulkInsert("Tags", tags, { transaction: trans });

      // 4) Products
      const productGroups = catGroups;
      const products = range(N_PRODUCTS).map((id) => {
        const createdAt = past(200);
        const categoryId = rand(1, catGroups.length);
        return {
          id,
          name: faker.commerce.productName(),
          imagePath: unsplashFromGroup(
            productGroups[categoryId - 1],
            1000,
            750
          ),
          price: money(5, 500),
          summary: faker.commerce.productDescription(),
          description: faker.lorem.paragraphs({
            min: 2,
            max: 4,
            separator: "\n\n",
          }),
          stars: 0,
          reviewCount: 0,
          categoryId,
          createdAt,
          updatedAt: new Date(),
        };
      });
      await queryInterface.bulkInsert("Products", products, { transaction: trans });

      // 5) Images
      let imageId = 1;
      const images = [];
      for (const p of products) {
        const count = rand(3, 5);
        const mainIndex = rand(0, count - 1);
        for (let i = 0; i < count; i++) {
          images.push({
            id: imageId++,
            productId: p.id,
            imagePath: unsplashFromGroup(
              productGroups[p.categoryId - 1],
              1000,
              750
            ),
            altText: `${p.name} ${i + 1}`,
            displayOrder: i + 1,
            isMain: i === mainIndex,
            createdAt: past(180),
            updatedAt: new Date(),
          });
        }
      }
      await queryInterface.bulkInsert("Images", images, { transaction: trans });

      // 6) ProductTags
      const productTags = [];
      for (const p of products) {
        const count = rand(1, 3);
        const tagIds = faker.helpers.arrayElements(range(N_TAGS), count);
        for (const tagId of tagIds) {
          productTags.push({
            productId: p.id,
            tagId,
            createdAt: past(160),
            updatedAt: new Date(),
          });
        }
      }
      await queryInterface.bulkInsert("ProductTags", productTags, {
        transaction: trans,
      });

      // 7) Addresses
      let addressId = 1;
      const addresses = [];
      for (const u of users) {
        const count = rand(1, 2);
        for (let i = 0; i < count; i++) {
          addresses.push({
            id: addressId++,
            userId: u.id,
            fullName: `${u.firstName} ${u.lastName}`,
            phoneNumber: u.phoneNumber,
            addressLine: faker.location.streetAddress({ useFullAddress: true }),
            isDefault: i === 0,
            createdAt: past(200),
            updatedAt: new Date(),
          });
        }
      }
      await queryInterface.bulkInsert("Addresses", addresses, {
        transaction: trans,
      });

      // 8) CartItems
      const cartItems = [];
      const cartKey = new Set();
      while (cartItems.length < N_CARTITEMS) {
        const userId = rand(1, N_USERS);
        const productId = rand(1, N_PRODUCTS);
        const key = `${userId}-${productId}`;
        if (cartKey.has(key)) continue;
        cartKey.add(key);

        const price = products[productId - 1].price;
        cartItems.push({
          id: cartItems.length + 1,
          userId,
          productId,
          quantity: rand(1, 3),
          price,
          createdAt: past(60),
          updatedAt: new Date(),
        });
      }
      await queryInterface.bulkInsert("CartItems", cartItems, {
        transaction: trans,
      });

      // 9) Orders + 10) OrderDetails + 11) Payments
      const payMethods = [
        "COD",
        "PAYPAL",
        "PAYOS",
        "BANK_TRANSFER",
        "CREDIT_CARD",
      ];
      const gateways = ["INTERNAL", "PAYPAL", "PAYOS", "VNPAY", "MOMO"];

      let orderId = 1;
      const orders = [];
      const orderDetails = [];
      const payments = [];

      for (let i = 0; i < N_ORDERS; i++) {
        const userId = rand(1, N_USERS);
        const createdAt = past(180);

        const itemsCount = rand(1, 5);
        let total = 0;

        const chosenProducts = faker.helpers.arrayElements(
          range(N_PRODUCTS),
          itemsCount
        );

        for (const pid of chosenProducts) {
          const price = products[pid - 1].price;
          const qty = rand(1, 3);
          total += price * qty;

          orderDetails.push({
            orderId,
            productId: pid,
            quantity: qty,
            price,
            total: Number((price * qty).toFixed(2)),
            createdAt,
            updatedAt: new Date(),
          });
        }

        const discountRate = Number((Math.random() * 0.15).toFixed(2));
        const finalAmount = Number((total * (1 - discountRate)).toFixed(2));

        const status = (() => {
          const r = Math.random();
          if (r < 0.1) return "Pending";
          if (r < 0.3) return "Processing";
          if (r < 0.55) return "Shipped";
          if (r < 0.9) return "Delivered";
          return "Cancelled";
        })();

        let paymentStatus = "Pending";
        if (status === "Delivered")
          paymentStatus = Math.random() < 0.96 ? "Paid" : "Refunded";
        else if (status === "Cancelled")
          paymentStatus = Math.random() < 0.8 ? "Refunded" : "Failed";
        else if (status === "Shipped" || status === "Processing")
          paymentStatus = Math.random() < 0.7 ? "Paid" : "Pending";

        const orderNumber = `ORD-${String(orderId).padStart(6, "0")}`;
        const addrArr = addresses.filter((a) => a.userId === userId);
        const addr = addrArr.length
          ? addrArr[rand(0, addrArr.length - 1)]
          : addresses[rand(0, addresses.length - 1)];

        orders.push({
          id: orderId,
          orderNumber,
          userId,
          status,
          paymentStatus,
          totalAmount: Number(total.toFixed(2)),
          discount: Number((discountRate * total).toFixed(2)),
          shippingFee: 0,
          finalAmount,
          shippingFullName: addr.fullName,
          shippingAddressLine: addr.addressLine,
          shippingPhoneNumber: addr.phoneNumber,
          notes: Math.random() < 0.25 ? sentence() : null,
          createdAt,
          updatedAt: dayjs(createdAt).add(rand(0, 20), "day").toDate(),
        });

        const method = faker.helpers.arrayElement(payMethods);
        const gateway = faker.helpers.arrayElement(gateways);
        const paid = paymentStatus === "Paid" || paymentStatus === "Refunded";
        const refunded = paymentStatus === "Refunded";

        payments.push({
          id: orderId, // nếu bảng Payments có identity, set seq lại ở cuối là an toàn
          orderId,
          userId,
          paymentMethod: method,
          paymentGateway: gateway,
          amount: finalAmount,
          currency: "VND",
          paymentStatus,
          transactionId: paid ? faker.string.alphanumeric(16) : null,
          externalTransactionId: paid ? faker.string.alphanumeric(20) : null,
          gatewayData: JSON.stringify({
            bankCode: faker.finance.bic(),
            ref: faker.string.uuid(),
          }),
          paidAt: paid ? past(150) : null,
          refundedAt: refunded ? past(100) : null,
          failureReason: paymentStatus === "Failed" ? sentence() : null,
          description: `Payment for ${orderNumber}`,
          notes: Math.random() < 0.2 ? sentence() : null,
          ipAddress: faker.internet.ip(),
          userAgent: faker.internet.userAgent(),
          createdAt,
          updatedAt: new Date(),
        });

        orderId++;
      }

      await queryInterface.bulkInsert("Orders", orders, { transaction: trans });
      await queryInterface.bulkInsert("OrderDetails", orderDetails, {
        transaction: trans,
      });
      await queryInterface.bulkInsert("Payments", payments, {
        transaction: trans,
      });

      // 12) Reviews
      const reviews = [];
      const reviewKey = new Set();
      while (reviews.length < N_REVIEWS) {
        const userId = rand(1, N_USERS);
        const productId = rand(1, N_PRODUCTS);
        const key = `${userId}-${productId}`;
        if (reviewKey.has(key)) continue;
        reviewKey.add(key);

        reviews.push({
          id: reviews.length + 1,
          userId,
          productId,
          rating: rand(1, 5),
          title: faker.lorem.words(3),
          comment: faker.lorem.sentences(2),
          createdAt: past(100),
          updatedAt: new Date(),
        });
      }
      await queryInterface.bulkInsert("Reviews", reviews, { transaction: trans });

      // ====== Cập nhật stars & reviewCount ======
      const [rows] = await queryInterface.sequelize.query(
        `
          SELECT "productId", COUNT(*) AS review_count, AVG("rating") AS avg_rating
          FROM "Reviews"
          GROUP BY "productId"
        `,
        { transaction: trans }
      );

      for (const row of rows) {
        await queryInterface.bulkUpdate(
          "Products",
          {
            reviewCount: parseInt(row.review_count, 10),
            stars: Number(Number(row.avg_rating).toFixed(2)),
            updatedAt: new Date(),
          },
          { id: row.productid || row.productId },
          { transaction: trans }
        );
      }

      // ====== 🔧 Reset toàn bộ sequences về MAX(id)+1 ======
      await resetAllSeqs(queryInterface.sequelize, trans);

      await trans.commit();
    } catch (err) {
      await trans.rollback();
      console.error("Seed failed:", err);
      throw err;
    }
  },

  async down(queryInterface) {
    const trans = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete("Reviews", null, { transaction: trans });
      await queryInterface.bulkDelete("Payments", null, { transaction: trans });
      await queryInterface.bulkDelete("OrderDetails", null, { transaction: trans });
      await queryInterface.bulkDelete("Orders", null, { transaction: trans });
      await queryInterface.bulkDelete("CartItems", null, { transaction: trans });
      await queryInterface.bulkDelete("Addresses", null, { transaction: trans });
      await queryInterface.bulkDelete("ProductTags", null, { transaction: trans });
      await queryInterface.bulkDelete("Images", null, { transaction: trans });
      await queryInterface.bulkDelete("Products", null, { transaction: trans });
      await queryInterface.bulkDelete("Tags", null, { transaction: trans });
      await queryInterface.bulkDelete("Categories", null, { transaction: trans });
      await queryInterface.bulkDelete("Users", null, { transaction: trans });
      await trans.commit();
    } catch (err) {
      await trans.rollback();
      throw err;
    }
  },
};
