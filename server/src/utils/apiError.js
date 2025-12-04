class ApiError extends Error {
    constructor (statusCode, message, errors = [], stack = ""){
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;

        this.errors = errors;
        
        if(stack){
            this.stack = stack;
        } else {
            //if stack is not provided, capture it
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError;