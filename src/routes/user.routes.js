import { Router } from "express";
import {
    changeCurrentPassword,
    getCurrrentUser,
    getUserChannelProfile,
    getUserWatchHistroy,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateCoverImage,
    updateUserAvatar,
    updateUserDetails
} from "../controllers/user.controller.js";
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
router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/change-user").post(verifyJWT, getCurrrentUser);
router.route("/update-account").patch(verifyJWT, updateUserDetails);
router.route("/change-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/change-coverImage").patch(verifyJWT, upload.single("coverImage"), updateCoverImage);


router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT, getUserWatchHistroy);




export default router;
