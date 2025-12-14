//blacklist luc cac token bi vo hieu hoa
const tokenBlackList = new Set();

//them token vao blacklist
export const addToBlackList = (token) => tokenBlackList.add(token);

//kiem tra token co nam trong blacklist
export const isTokenBlackListed = (token) => tokenBlackList.has(token);

//xoa token khoi blacklist
export const removeFromBlackList = (token) => tokenBlackList.remove(token);

