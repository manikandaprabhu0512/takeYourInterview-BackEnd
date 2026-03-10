import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

    console.log("Token Fetched...", token);

    if (!token) {
      return res.status(400).json({ message: "user does not have a token" });
    }
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token Verifyed");

    if (!verifyToken) {
      return res
        .status(400)
        .json({ message: "user does not have a valid token" });
    }
    req.userId = verifyToken.userId;

    next();
  } catch (error) {
    return res.status(500).json({ message: `isAuth error ${error}` });
  }
};

export default isAuth;
