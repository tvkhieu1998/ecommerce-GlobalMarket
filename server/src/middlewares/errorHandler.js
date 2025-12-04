const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || err.status || 500;

    //chuan bi tra ve loi
    const errorResponse = {
        statusCode: statusCode,
        message: err.message || 'An Unexpected Error Occurred',
        data: err.data || null,
        errors: err.errors || [],
        stack: process.env.NODE_ENV === 'development' ? err.stack : "",
    };
    //log error to console for debugging
    console.error(err);

    //send error response to client
    res.status(statusCode).json(errorResponse);
}

export default errorHandler;