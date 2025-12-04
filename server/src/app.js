import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
const app = express();

//Cau hinh Cors cho phep cac client tu cac nguon khac truy cap API
app.use(cors());

// Cau hinh Morgan de ghi log cho cac HTTP request
app.use(morgan('dev'));

//Cau hinh de express co the doc thong tin gui qua body cua request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.use('/api/v1', routes);

//xu ly loi toan cuc
//loi request 404 not found
app.use((req, res, next) => {
    const error = new Error('Request Not Found');
    error.statusCode = 404;
    next(error);
})
//xu ly cac loi con lai
app.use(errorHandler);

export default app;