import jwt from 'jsonwebtoken';
import ApiError from '../utils/apiError.js';
import Models from '../models/index.js';
import { isTokenBlackListed } from '../utils/tokenBlackList.js';
const {User} = Models;

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            throw new ApiError(401, "Thieu Token");
        }

        if(isTokenBlackListed(token)){
            throw new ApiError(401, "Token da bi vo hieu hoa");
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'default_secret'
        );

        const user = await User.findByPk(decoded.id, {
            attributes: {exclude: ["password"]}
        });

        if(!user){
            throw new ApiError(401, "User khong ton tai")
        };
        req.user = user;
        req.token = token;

        next();
    } catch (error){
        if (error.name === "JsonWebTokenError"){
            error = new ApiError(401, "Token khong hop le");
        } else if (error.name === "TokenExpiredError"){
            error = new ApiError (401, "Token da het han");
        }
        next(error);
    }
}

export const requiredAdmin = async (req, res, next) => {
    try {
        if (!req.user){
            throw new ApiError(401, "Nguoi dung chua xac thuc");
        }
        if (req.user.role != "Admin"){
            throw new ApiError (403, "Chi Admin duoc su dung tinh nang nay");
        }
        next();
    } catch (error){
        next(error);
    }
}
//export default {authenticateToken};