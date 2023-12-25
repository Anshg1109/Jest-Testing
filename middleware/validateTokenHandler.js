const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken =  (req, res, next) => {
  let token;
  let authHeader = req.headers.Authorization || req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res.status(401).json({ message: 'User is not authorized or token is missing' });
  }
  try {
    token = authHeader.split(" ")[1];
    if (token === 'null' || !token) {
      res.status(401);
      throw new Error("User is not authorized or token is missing");
    }
    
    let verifiedUser =jwt.verify(token, process.env.ACCESS_TOKEN_SECERT);
    if (!verifiedUser) return res.status(401).send('Unauthorized request');
    req.user = verifiedUser;
    next();

  }catch (error) {
    res.status(400).send("Invalid Token");
  }
};

module.exports = validateToken;