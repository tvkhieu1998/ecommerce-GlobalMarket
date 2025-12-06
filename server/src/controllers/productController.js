import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import models from '../models/index.js';
import { Op } from 'sequelize';
const { Product, Category, Tag } = models;
const controller = {};

controller.getAllProducts = async (req, res) => {
    let { search, categoryId, tagId, minPrice, maxPrice, page = 1, limit = 10, sortBy = "price", sortOrder = "ASC" } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    let options = {
        where: {},
        limit: limitNum,
        offset: offset,
        order: [[sortBy, sortOrder]],
        include: [
            {
                model: Category,
                as: 'Category',
                attributes: ['id', 'name'],
                required: false,
            },
            {
                model: Tag,
                as: 'Tags',
                through: { attributes: [] }, //khong lay attribute tu bang trung gian ProductTag
                attributes: ['id', 'name'],
                required: false,
            }
        ],
        distinct: true //khong cho lay trung san pham khi co quan he many-to-many
    }
    //Loc theo search
    if(search) {
        options.where[Op.or] = [
            { name: {[Op.iLike]: `%${search}%` } },
            { description: {[Op.iLike]: `%${search}%` } },
            { summary: {[Op.iLike]: `%${search}%` } }
        ]
    };

    //loc theo categoryId
    if(categoryId) {
        if( isNaN(categoryId) ) {
            throw new ApiError(400, "categoryId phai la mot so nguyen");
        }
        else
            options.where.categoryId = parseInt(categoryId);
    };

    //loc theo gia
    if(minPrice){
        if(isNaN(minPrice)) {
            throw new ApiError(400, "minPrice phai la mot so thuc");
        }
        else
            options.where.price = { [Op.gte]: parseFloat(minPrice) };
    }
    if(maxPrice){
        if(isNaN(maxPrice)) {
            throw new ApiError(400, "maxPrice phai la mot so thuc");
        }
        else
            options.where.price = { [Op.lte]: parseFloat(maxPrice) };
    };

    //Loc theo tagId
    if(tagId) {
        if(isNaN(tagId)) {
            throw new ApiError(400, "tagId phai la mot so nguyen");
        }
        else {
            tagId = parseInt(tagId);
            options.include[1].where = { id: tagId };
            options.include[1].required = true; //bat buoc phai co tagId moi lay san pham
        }
    };

    //sort
    const validSortByFields = ["name", "price", "createdAt"];
    const validSortOrders = ["ASC", "DESC"];

    if (validSortByFields.includes(sortBy) && validSortOrders.includes(sortOrder)){
        options.order = [[sortBy, sortOrder]];
    }
    else {
        sortBy = "price";
        sortOrder = "ASC";
        options.order = [["price", "ASC"]];
    }

    const { count, rows } = await Product.findAndCountAll(options);
    //Neu khong co san pham nao thoa dieu kien
    if(rows.length === 0) {
        throw new ApiError(404, "Khong tim thay san pham nao");
    }
    //Tra ve ket qua
    else{
        const responseData = {
            products: rows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limitNum),
                currentPage: pageNum,
                limit: limitNum
            },
            filter: {
                search: search || null,
                categoryId: categoryId || null,
                tagId: tagId || null,
                minPrice: minPrice || null,
                maxPrice: maxPrice || null,
                limit: limitNum,
                page: pageNum,
                sortBy: sortBy,
                sortOrder: sortOrder
            }
        }
        res
            .status(200)
            .json(new ApiResponse(200, responseData, "Tim danh sach san pham thanh cong"));
    }
};

controller.getProductById = async (req, res) => {
  let { id } = req.params;
  if(isNaN(id)) {
    throw new ApiError(400, "ID phai la mot so nguyen");
  }
  id = parseInt(id);   
  const product = await Product.findByPk(id, {
    include: [
        { model: Category, attributes: ['id', 'name'], required: false },
        {
            model: Tag,
            through: { attributes: [] }, //khong lay attribute tu bang trung gian ProductTag
            attributes: ['id', 'name'],
            required: false,
        }
    ]
  });
  if(!product) 
    throw new ApiError(404, `Khong tim thay san pham`);
  res
    .status(200)
    .json(new ApiResponse(200, product, "Tim san pham thanh cong"));
};

controller.createProduct = async (req, res) => {
    const { name, imagePath, price, summary, description, categoryId } = req.body;
    //validate du lieu dau vao
    if(!name) {
        throw new ApiError(400, "Name khong duoc de trong");
    }
    if (!price) {
        throw new ApiError(400, "Price khong duoc de trong");
    }
    if(isNaN(price)) {
        throw new ApiError(400, "price phai la so thuc");
    }

    if(categoryId && isNaN(categoryId)) {
        throw new ApiError(400, "categoryId phai la so nguyen");
    }

    //Tao san pham moi
    let newProduct = ({
        name,
        price: parseFloat(price)
    });
    if(imagePath) newProduct.imagePath = imagePath;
    if(summary) newProduct.summary = summary;
    if(description) newProduct.description = description;
    if(categoryId) newProduct.categoryId = parseInt(categoryId);
    newProduct = await Product.create(newProduct);
    res
        .status(201)
        .json(new ApiResponse(201, newProduct, "Tao san pham thanh cong"));
};

controller.updateProduct = async(req, res) => {
    let { id } = req.params;
    let { name, description, price, categoryId, summary, imagePath } = req.body;
    if(isNaN(id)) {
        throw new ApiError(400, "ID phai la mot so nguyen");
    };
    if(!name) {
        throw new ApiError(400, "Name khong duoc de trong");
    };
    if (!price) {
        throw new ApiError(400, "Price khong duoc de trong");
    };
    if(isNaN(price)) {
        throw new ApiError(400, "price phai la so thuc");
    };

    if(categoryId && isNaN(categoryId)) {
        throw new ApiError(400, "categoryId phai la so nguyen");
    };
    id = parseInt(id);
    const product = await Product.findByPk(id);
    if(!product){
        throw new ApiError(404, `Khong tim thay san pham`);
    }
    if(name) product.name = name;
    if(summary) product.summary = summary;
    if(imagePath) product.imagePath = imagePath;
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
        categoryId = parseInt(categoryId);
        let category = await Category.findByPk(categoryId);
        if(!category) {
            throw new ApiError(404, `Khong tim thay danh muc voi ID la ${categoryId}`);
        }
        product.categoryId = categoryId;
    }
    await product.save();
    res
        .status(200)
        .json(new ApiResponse(200, product, "Cap nhat san pham thanh cong"));
};

controller.deleteProduct = async(req, res) => {
    let { id } = req.params;
    if(isNaN(id)) {
        throw new ApiError(400, "ID phai la mot so nguyen");
    }
    id = parseInt(id);
    const product = await Product.findByPk(id);
    if(!product) {
        throw new ApiError(404, `Khong tim thay san pham`);
    }
    await product.destroy({ where: { id: id } });
    res
        .status(200)
        .json(new ApiResponse(204, null, "Xoa san pham thanh cong"));
};

export default controller;