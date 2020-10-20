import jwt from "jsonwebtoken";
// import { promisify } from "util";
import config from "../../config";

import { Request, Response, NextFunction } from "express";

interface Decoded{
    id: number;
}

const auth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = localStorage.getItem("token");

  if (!authHeader) {
    return res.status(401).send({ error: "No token provided" });
  }

  console.log("authHeader " + authHeader);
  

  const [scheme, token] = authHeader.split(" ");

  console.log("token "+ token);
  
  try {
    const decoded = jwt.verify(token, config.tokenSecret);

    const userId = (<Decoded>decoded).id;

    req.userId = userId;

    return next();
  } catch (err) {
    return res.status(401).send({ error: "Token invalid" });
  }
};

export default auth;