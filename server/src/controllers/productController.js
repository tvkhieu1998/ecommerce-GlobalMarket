import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import models from '../models/index.js';
const { Product } = models;
const controller = {};

controller.getAllProducts = (req, res) => {
    let { search, categoryId, minPrice, maxPrice } = req.query;
    let products = Product;
    //Loc theo search
    if(search) {
        products = products.filter((product) =>
            product.name.toLowerCase().includes(search.toLowerCase()) ||
            product.description.toLowerCase().includes(search.toLowerCase())
        );
    };

    //loc theo categoryId
    if(categoryId) {
        if( isNaN(categoryId) ) {
            throw new ApiError(400, "categoryId phai la mot so nguyen");
        }
        else
            products = products.filter((product) => product.categoryId === parseInt(categoryId));
    };

    //loc theo gia
    if(minPrice){
        if(isNaN(minPrice)) {
            throw new ApiError(400, "minPrice phai la mot so thuc");
        }
        else
            products = products.filter((product) => product.price >= parseFloat(minPrice));
    }
    if(maxPrice){
        if(isNaN(maxPrice)) {
            throw new ApiError(400, "maxPrice phai la mot so thuc");
        }
        else
            products = products.filter((product) => product.price <= parseFloat(maxPrice));
    };

    //Neu khong co san pham nao thoa dieu kien
    if(products.length === 0) {
        throw new ApiError(404, "Khong tim thay san pham nao");
    }
    //Tra ve ket qua
    else{
        const responseData = {
            products: products,
            filter: {
                search: search || null,
                categoryId: categoryId || null,
                minPrice: minPrice || null,
                maxPrice: maxPrice || null
            }
        }
        res
            .status(200)
            .json(new ApiResponse(200, responseData, "Tim danh sach san pham thanh cong"));
    }
};

controller.getProductById = (req, res) => {
  let { id } = req.params;
  if(isNaN(id)) {
    throw new ApiError(400, "ID phai la mot so nguyen");
  }
  const product = Product.find((product) => product.id === parseInt(id));
  if(!product) {
    throw new ApiError(404, `Khong tim thay san pham`);
  }
  res
    .status(200)
    .json(new ApiResponse(200, product, "Tim san pham thanh cong"));
};

controller.createProduct = (req, res) => {
    const { name, description, price, categoryId } = req.body;
    //validate du lieu dau vao
    if(!name || !description || !price || !categoryId) {
        throw new ApiError(400, "Thieu thong tin bat buoc de tao san pham");
    }

    if(isNaN(price)) {
        throw new ApiError(400, "price phai la so thuc");
    }

    if(isNaN(categoryId)) {
        throw new ApiError(400, "categoryId phai la so nguyen");
    }

    //Tao san pham moi
    const newProduct = {
        id: Product.length + 1,
        name,
        description,
        price: parseFloat(price),
        categoryId: parseInt(categoryId)
    };
    Product.push(newProduct);
    res
        .status(201)
        .json(new ApiResponse(201, newProduct, "Tao san pham thanh cong"));
};

controller.updateProduct = (req, res) => {
    let { id } = req.params;
    const { name, description, price, categoryId } = req.body;
    if(isNaN(id)) {
        throw new ApiError(400, "ID phai la mot so nguyen");
    }
    const product = Product.find((product) => product.id === parseInt(id));
    if(!product){
        throw new ApiError(404, `Khong tim thay san pham`);
    }
    if(name) product.name = name;
    if(description) product.description = description;  
    if(price) {
        if(isNaN(price)) {
            throw new ApiError(400, "price phai la so thuc");
        }
        product.price = parseFloat(price);
    }
    if(categoryId) {
        if(isNaN(categoryId)) {
            throw new ApiError(400, "categoryId phai la so nguyen");
        }
        product.categoryId = parseInt(categoryId);
    }
    res
        .status(200)
        .json(new ApiResponse(200, product, "Cap nhat san pham thanh cong"));
};

controller.deleteProduct = (req, res) => {
    let { id } = req.params;
    if(isNaN(id)) {
        throw new ApiError(400, "ID phai la mot so nguyen");
    }
    const product = Product.find((product)=> product.id === parseInt(id));
    if(!product) {
        throw new ApiError(404, `Khong tim thay san pham`);
    }
    Product.splice(Product.indexOf(product), 1);
    res
        .status(200)
        .json(new ApiResponse(204, null, "Xoa san pham thanh cong"));
};

export default controller;