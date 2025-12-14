import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import models from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {addToBlackList} from '../utils/tokenBlackList.js'
const { User } = models;
const controller = {};

//create User
controller.register = async (req, res) => {
    const {firstName, lastName, password, confirmPassword, phoneNumber, email} = req.body;

    //Kiem tra du lieu nhap vao
    if (!email || !firstName || !lastName || !password || !phoneNumber){
        throw new ApiError(400, 'Thieu du lieu nhap vao');
    };

    //ktra format email
    const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
    if (!emailRegex.test(email)){
        throw new ApiError(400, 'Nhap sai format email');
    };

    //set format password ;
    //Password: length >= 8, lowerChar, upperChar, Ki tu dac biet, number
    const validPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;;
    if(!validPassword.test(password)){
        throw new ApiError(400, "Mat Khau it nhat 8 ky tu bao gom: Chu Hoa, Chu Thuong, So, Ki tu dac biet");
    }

    //check confirm password
    if (password != confirmPassword){
        throw new ApiError(400, "Confirm Password khong khop voi Password");
    }

    //check email existed!
    const existingUser = await User.findOne({ where: {email: email}});
    if (existingUser) {
        throw new ApiError (409, "Email da ton tai!");
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create ({
        email,
        password: hashedPassword,
        firstName,
        lastName, 
        phoneNumber,
        role: 'User'
    })

    //res inforUser
    const userResponse = {...newUser.toJSON()};
    delete userResponse.password;

    return res.status(201).json(new ApiResponse(201, userResponse, "Dang Ky Thanh Cong"))
}

//login
controller.login = async (req, res) => {
    const {email, password} = req.body;

    //kiem tra du lieu duoc nhap:
    if (!email || !password){
        throw new ApiError (400, "Nhap thieu thong tin!");
    }

    //kiem tra email
    const user = await User.findOne({where:  {email: email}});
    if (!user){
        throw new ApiError(401, "Tai khoan chua duoc dang ky");
    }

    //Kiem tra password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid){
        throw new ApiError (401, "Mat Khau Sai");
    }

    //tao jwt
    const token = jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role
    },
    process.env.JWT_SECRET || 'default_secret'
    ,{
        expiresIn: "1d"
    })
    
    const userResponse = {...user.toJSON()};
    delete userResponse.password;

    return res.status(200).json(new ApiResponse(200, {...userResponse, token}, "Dang Nhap Thanh Cong"));
}

//logout
controller.logout = async (req, res) => {
    //lay token
    const token = req.token;
    if(token) {
        addToBlackList(token);
    } else {
        throw new ApiError (400, null, "Thieu Token");
    }

    res.status(200).json(new ApiResponse(200, null, "Dang xuat thanh cong"));
}
export default controller;
