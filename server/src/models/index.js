const models = {};

//Mang Categories
const categories = [
    { id: 1, name: "Electronics" },
    { id: 2, name: "Clothing" },
    { id: 3, name: "Home & Kitchen" },
    { id: 4, name: "Books" },
    { id: 5, name: "Sports & Outdoors" }
];

//mang products
const products = [
    {
        id: 1,
        name: "Smartphone",
        description: "Latest model smartphone with advanced features",
        price: 699.99,
        categoryId: 1
    },
    {
        id: 2,
        name: "Running Shoes",
        description: "Comfortable and durable running shoes",
        price: 89.99,
        categoryId: 1
    },
    {
        id: 3,
        name: "Blender",
        description: "High-speed blender for smoothies and soups",
        price: 49.99,
        categoryId: 3
    },
    {
        id: 4,
        name: "Novel Book",
        description: "Bestselling novel by a renowned author",
        price: 14.99,
        categoryId: 2
    },
    {
        id: 5,
        name: "Yoga Mat",
        description: "Non-slip yoga mat for all types of exercises",
        price: 29.99,
        categoryId: 2
    },
    {
        id: 6,
        name: "Wireless Headphones",
        description: "Noise-cancelling wireless headphones with long battery life",
        price: 199.99,
        categoryId: 4
    },
    {
        id: 7,
        name: "Coffee Maker",
        description: "Programmable coffee maker with built-in grinder",
        price: 79.99,
        categoryId: 5
    },
    {
        id: 8,
        name: "Fitness Tracker",
        description: "Waterproof fitness tracker with heart rate monitor",
        price: 59.99,
        categoryId: 4
    },
    {
        id: 9,
        name: "Electric Kettle",
        description: "Fast-boiling electric kettle with temperature control",
        price: 39.99,
        categoryId: 5
    },
    {
        id: 10,
        name: "Action Camera",
        description: "4K action camera with wide-angle lens",
        price: 149.99,
        categoryId: 1
    }
];

models.Category = categories;
models.Product = products;

export default models;