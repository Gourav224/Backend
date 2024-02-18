import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { User } from "../models/user.models.js"


export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log(decodedToken);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        console.log(user);


        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
        req.user = user;
        console.log(req.user);

        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
})