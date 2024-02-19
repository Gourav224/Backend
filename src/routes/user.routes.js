import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middlerware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();


// user registration route
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1.
        }
    ])
    , registerUser);

// login route

router.route("/login").post(loginUser);


// secured routes

// logout user
router.route("/logout").post(verifyJWT, logoutUser);

// refresh access token
router.route("/refresh-token").post(refreshAccessToken)

export default router;
