/* src/seeders/000-init-all-data.js */
'use strict';
const bcrypt = require("bcryptjs");
const dayjs = require("dayjs");
const { faker } = require("@faker-js/faker");

// Mật khẩu mặc định cho tất cả user
const password = bcrypt.hashSync("123456", 10);

// --- Helpers ---
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const range = (n, start = 1) => Array.from({ length: n }, (_, i) => i + start);
const money = (min, max) => Number((Math.random() * (max - min) + min).toFixed(2));
const past = (days = 90) => {
  const end = new Date();
  const start = dayjs(end).subtract(days, "day").toDate();
  return new Date(start.getTime() + Math.random() * (end - start));
};
const sentence = () => {
  const words = "premium quality elegant durable stylish modern compact versatile smart eco friendly essential trendy portable classic pro edition".split(" ");
  const n = rand(6, 12);
  return (
    Array.from({ length: n }, () => words[rand(0, words.length - 1)])
      .join(" ")
      .replace(/^\w/, (c) => c.toUpperCase()) + "."
  );
};

// ===== Unsplash IDs (Giữ nguyên) =====
const UNSPLASH_IDS = {
  shoes: ["1542291026-7eec264c27ff", "1549298916-b41d501d3772", "1491553895911-0055eca6402d", "1551107696-a4b0c5a0d9a2", "1539185441755-769473a23570"],
  clothes: ["1564584217132-2271feaeb3c5", "1620799140408-edc6dcb6d633", "1556905055-8f358a7a47b2", "1479064555552-3ef4979f8908"],
  perfume: ["1458538977777-0549b2370168", "1523293182086-7651a899d37f", "1593487568720-92097fb460fb"],
  electronics: ["1611186871348-b1ce696e52c9", "1550009158-9ebf69173e03", "1611761226428-0a3ec16d2e78", "1517336714731-489689fd1ca8"],
  home: ["1484101403633-562f891dc89a", "1501045661006-fcebe0257c3f", "1503602642458-232111445657"],
  food: ["1504674900247-0877df9cc836", "1496116218417-1a781b1c416c", "1518779578993-ec3579fee39f"],
  portrait: ["1494790108377-be9c29b29330", "1547425260-76bcadfb4f2c", "1511367461989-f85a21fda167", "1580489944761-15a19d654956"],
};
const unsplashFromGroup = (group, w = 1000, h = 750) => {
  const ids = UNSPLASH_IDS[group] || UNSPLASH_IDS.shoes;
  const id = ids[rand(0, ids.length - 1)];
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
};

// ===== Quy mô dữ liệu =====
const N_USERS = 20;
const N_TAGS = 10;
const N_PRODUCTS = 50; // Sẽ sinh ra khoảng 50 * 3 = 150 variants
const N_REVIEWS = 200;
const N_CARTITEMS = 50;
const N_ORDERS = 30;

// --------- ✨ Helper: reset sequences cho Postgres ✨ ---------
function qIdent(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

async function resetSeq(sequelize, table, t) {
  const tbl = qIdent(table);
  const [rows] = await sequelize.query(
    `SELECT pg_get_serial_sequence('${tbl}', 'id')::text AS seq_name`,
    { transaction: t }
  );
  const seqName = rows?.[0]?.seq_name;
  if (!seqName) return;

  await sequelize.query(
    `SELECT setval('${seqName}', COALESCE((SELECT MAX("id") FROM ${tbl}), 0) + 1, false)`,
    { transaction: t }
  );
}

async function resetAllSeqs(sequelize, t) {
  const tables = [
    "Users", "Categories", "Tags", "Products", "ProductVariants", "Inventories", 
    "Images", "Addresses", "CartItems", "Orders", "Payments", "Reviews"
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
      console.log("Seeding Users...");
      const users = range(N_USERS).map((id) => {
        const createdAt = past(365);
        return {
          id,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: `user${id}@example.com`,
          password: password,
          phoneNumber: `0${rand(83000000, 98999999)}`,
          role: Math.random() < 0.9 ? "User" : "Admin",
          isActive: true,
          profileImage: unsplashFromGroup("portrait", 200, 200),
          createdAt,
          updatedAt: createdAt,
        };
      });
      await queryInterface.bulkInsert("Users", users, { transaction: trans });

      // 2) Categories
      console.log("Seeding Categories...");
      const catGroups = ["electronics", "shoes", "home", "clothes", "perfume", "food"];
      const categories = range(catGroups.length).map((id) => ({
        id,
        name: catGroups[id - 1],
        createdAt: past(300),
        updatedAt: new Date(),
      }));
      await queryInterface.bulkInsert("Categories", categories, { transaction: trans });

      // 3) Tags
      console.log("Seeding Tags...");
      const tagPool = ["Hot", "New", "Sale", "Limited", "Eco", "Premium", "Budget", "Best Seller"];
      const tags = range(N_TAGS).map((id) => ({
        id,
        name: faker.helpers.arrayElement(tagPool) + " " + faker.word.noun(),
        createdAt: past(200),
        updatedAt: new Date(),
      }));
      await queryInterface.bulkInsert("Tags", tags, { transaction: trans });

      // 4) Products
      console.log("Seeding Products...");
      const productGroups = catGroups;
      const products = range(N_PRODUCTS).map((id) => {
        const categoryId = rand(1, catGroups.length);
        const pName = faker.commerce.productName();
        return {
          id,
          name: pName,
          slug: faker.helpers.slugify(pName + " " + id).toLowerCase(), // Tạo slug
          imagePath: unsplashFromGroup(productGroups[categoryId - 1], 1000, 750),
          summary: faker.commerce.productDescription(),
          description: faker.lorem.paragraphs(2),
          stars: 0,
          reviewCount: 0,
          categoryId,
          isActive: true,
          createdAt: past(200),
          updatedAt: new Date(),
        };
      });
      await queryInterface.bulkInsert("Products", products, { transaction: trans });

      // 5) ProductVariants & Inventories
      console.log("Seeding Variants & Inventory...");
      const variants = [];
      const inventories = [];
      let varIdCounter = 1;
      let inventoryIdCounter = 1;

      // Danh sách option mẫu
      const sizes = ['S', 'M', 'L', 'XL'];
      const colors = ['Red', 'Blue', 'Black', 'White', 'Green'];
      const materials = ['Cotton', 'Polyester', 'Leather', 'Denim'];

      for (const p of products) {
        // Mỗi sản phẩm tạo 2-4 biến thể
        const numVariants = rand(2, 4);
        
        for (let i = 0; i < numVariants; i++) {
          const size = sizes[i % sizes.length];
          const color = colors[rand(0, colors.length - 1)];
          const basePrice = money(10, 500);
          
          variants.push({
            id: varIdCounter,
            productId: p.id,
            sku: `SKU-${p.id}-${size}-${color}`.toUpperCase(),
            price: basePrice,
            originalPrice: Number((basePrice * 1.2).toFixed(2)),
            options: JSON.stringify({ Size: size, Color: color, Material: materials[rand(0, 3)] }),
            imagePath: p.imagePath,
            createdAt: p.createdAt,
            updatedAt: new Date(),
          });

          // Tạo Inventory ngay cho variant này
          inventories.push({
            id: inventoryIdCounter++,
            productVariantId: varIdCounter,
            quantity: rand(0, 100), // Có thể hết hàng (0)
            reservedQuantity: rand(0, 5),
            shelfLocation: `Kệ ${String.fromCharCode(65 + rand(0, 5))}-${rand(1, 10)}`,
            lowStockThreshold: 10,
            createdAt: p.createdAt,
            updatedAt: new Date(),
          });

          varIdCounter++;
        }
      }
      await queryInterface.bulkInsert("ProductVariants", variants, { transaction: trans });
      await queryInterface.bulkInsert("Inventories", inventories, { transaction: trans });

      // 6) Images (Gallery cho Product)
      console.log("Seeding Gallery Images...");
      let imageId = 1;
      const images = [];
      for (const p of products) {
        const count = rand(2, 4);
        for (let i = 0; i < count; i++) {
          images.push({
            id: imageId++,
            productId: p.id,
            imagePath: unsplashFromGroup(productGroups[p.categoryId - 1], 1000, 750),
            altText: `${p.name} ${i + 1}`,
            displayOrder: i + 1,
            isMain: false,
            createdAt: past(180),
            updatedAt: new Date(),
          });
        }
      }
      await queryInterface.bulkInsert("Images", images, { transaction: trans });

      // 7) ProductTags
      console.log("Seeding Product Tags...");
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
      await queryInterface.bulkInsert("ProductTags", productTags, { transaction: trans });

      // 8) Addresses
      console.log("Seeding Addresses...");
      let addressId = 1;
      const addresses = [];
      for (const u of users) {
        addresses.push({
          id: addressId++,
          userId: u.id,
          fullName: `${u.firstName} ${u.lastName}`,
          phoneNumber: u.phoneNumber,
          addressLine: faker.location.streetAddress({ useFullAddress: true }),
          countryCode: 'VN',
          state: 'Ho Chi Minh',
          city: 'Thu Duc',
          postalCode: '700000',
          isDefault: true,
          createdAt: past(200),
          updatedAt: new Date(),
        });
      }
      await queryInterface.bulkInsert("Addresses", addresses, { transaction: trans });

      // 9) CartItems (Link tới Variant)
      console.log("Seeding Cart Items...");
      const cartItems = [];
      // Lấy danh sách ID của Variant để random
      const variantIds = variants.map(v => v.id);
      //Luu cac cap "userId va variantId"
      const existingCartPairs = new Set();

      while (cartItems.length < N_CARTITEMS) {
        const userId = rand(1, N_USERS);
        const variantId = variantIds[rand(0, variantIds.length - 1)];
        
        //Tao uniqueKey de kiem tra:
        const uniqueKey = `${userId}-${variantId}`;
        if (existingCartPairs.has(uniqueKey)) {
            continue; //Co roi thi bo qua
        }
        existingCartPairs.add(uniqueKey); //Chua co thi them vao

        cartItems.push({
          id: cartItems.length + 1,
          userId,
          productVariantId: variantId,
          quantity: rand(1, 3),
          createdAt: past(60),
          updatedAt: new Date(),
        });
      }
      await queryInterface.bulkInsert("CartItems", cartItems, { transaction: trans });

      // 10) Orders + OrderDetails + Payments
      console.log("Seeding Orders...");
      const payMethods = ["COD", "PAYPAL", "CREDIT_CARD"];
      let orderId = 1;
      const orders = [];
      const orderDetails = [];
      const payments = [];

      for (let i = 0; i < N_ORDERS; i++) {
        const userId = rand(1, N_USERS);
        const createdAt = past(180);
        let total = 0;

        // Chọn random vài Variant để mua
        const chosenVariantIds = faker.helpers.arrayElements(variantIds, rand(1, 4));

        for (const vid of chosenVariantIds) {
          // Tìm lại thông tin variant để lấy giá
          const variantInfo = variants.find(v => v.id === vid);
          const price = variantInfo.price;
          const qty = rand(1, 2);
          total += price * qty;

          orderDetails.push({
            orderId,
            productVariantId: vid,
            quantity: qty,
            price: price, // Giá tại thời điểm mua
            total: Number((price * qty).toFixed(2)),
            createdAt,
            updatedAt: new Date(),
          });
        }

        const finalAmount = total; // Giản lược discount
        const status = faker.helpers.arrayElement(["Pending", "Shipped", "Delivered", "Cancelled"]);
        
        // Tạo Order
        const userAddr = addresses.find(a => a.userId === userId) || addresses[0];
        orders.push({
          id: orderId,
          orderNumber: `ORD-${String(orderId).padStart(6, "0")}`,
          userId,
          status,
          paymentStatus: status === "Delivered" ? "Paid" : "Pending",
          totalAmount: Number(total.toFixed(2)),
          discount: 0,
          shippingFee: 0,
          finalAmount: Number(finalAmount.toFixed(2)),
          shippingFullName: userAddr.fullName,
          shippingAddressLine: userAddr.addressLine,
          shippingPhoneNumber: userAddr.phoneNumber,
          notes: null,
          createdAt,
          updatedAt: createdAt,
        });

        // Tạo Payment
        payments.push({
          orderId,
          userId,
          paymentMethod: faker.helpers.arrayElement(payMethods),
          amount: finalAmount,
          currency: "VND", // Global thì chỗ này linh động, nhưng seed cứ để VND/USD
          paymentStatus: status === "Delivered" ? "Paid" : "Pending",
          createdAt,
          updatedAt: createdAt,
        });

        orderId++;
      }

      await queryInterface.bulkInsert("Orders", orders, { transaction: trans });
      await queryInterface.bulkInsert("OrderDetails", orderDetails, { transaction: trans });
      await queryInterface.bulkInsert("Payments", payments, { transaction: trans });

      // 11) Reviews (Vẫn link tới Product)
      console.log("Seeding Reviews...");
      const reviews = [];
      for (let i = 0; i < N_REVIEWS; i++) {
        const userId = rand(1, N_USERS);
        const productId = rand(1, N_PRODUCTS); // Review theo Product cha
        reviews.push({
          id: i + 1,
          userId,
          productId,
          rating: rand(3, 5), // Seed toàn review tốt cho đẹp :))
          title: faker.lorem.words(3),
          comment: faker.lorem.sentence(),
          createdAt: past(100),
          updatedAt: new Date(),
        });
      }
      await queryInterface.bulkInsert("Reviews", reviews, { transaction: trans });

      // ====== Cập nhật Aggregate Fields (Stars, ReviewCount) ======
      console.log("Aggregating Reviews...");
      const [rows] = await queryInterface.sequelize.query(
        `SELECT "productId", COUNT(*) AS review_count, AVG("rating") AS avg_rating FROM "Reviews" GROUP BY "productId"`,
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
          { id: row.productId || row.productid }, // Postgres trả về lowercase
          { transaction: trans }
        );
      }

      // ====== 🔧 Reset toàn bộ sequences ======
      await resetAllSeqs(queryInterface.sequelize, trans);

      await trans.commit();
      console.log("Seeding Completed Successfully!");

    } catch (err) {
      await trans.rollback();
      console.error("Seed failed:", err);
      throw err;
    }
  },

  async down(queryInterface) {
    const trans = await queryInterface.sequelize.transaction();
    try {
      // Xóa theo thứ tự ngược lại của FK
      const tables = [
        "Reviews", "Payments", "OrderDetails", "Orders", "CartItems", 
        "Addresses", "ProductTags", "Images", 
        "Inventories", "ProductVariants", "Products",
        "Tags", "Categories", "Users"
      ];

      for (const tb of tables) {
        await queryInterface.bulkDelete(tb, null, { transaction: trans });
      }
      await trans.commit();
    } catch (err) {
      await trans.rollback();
      throw err;
    }
  },
};