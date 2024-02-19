import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/fileupload.js";
import { ApiResponse } from "../utils/ApiResponse.js"


const generateRefreshAndAccessToken = async (userId) => {
    try {
        let user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        user = await User.findById(userId);
        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}



const registerUser = asyncHandler(async (req, res) => {
    // get user deatils form frontend
    // validation - notempty
    // check if user already exists : username
    // check for images , check for avator 
    // upload them ro cloudinary ,avatar
    // create user object - create  entery in db
    // remove pass word and refresh token field form resprose
    // check for user creation
    // return res
    const { username, email, fullName, password } = req.body;


    if (
        [fullName, email, username, password].some((field) => {
            return field?.trim() === "";
        })
    ) {
        throw new ApiError(400, 'All fields are required');
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // console.log(req.files);
    // console.log(req);


    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;

    }


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }
    // upload image on cloundinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    // console.log(avatar)
    if (!avatar) {
        throw new ApiError(409, "Avatar file is required");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        password,
        email,
    });


    const userCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!userCreated) {
        throw new ApiError(500, "Something went wrong when creating the user ");
    }
    return res.status(201).json(
        new ApiResponse(200, userCreated, "user created Sucessfully")
    );
})


const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookie 
    // send res


    const { email, username, password } = req.body;
    console.log(email, username, password);
    if (!username && !email) {
        throw new ApiError(400, "username  or email is Required");
    }
    if (!password) {
        throw new ApiError(400, "Password  is Required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "user does not exist");
    }

    const isPasswordvalid = await user.isPasswordCorrect(password);

    if (!isPasswordvalid) {
        throw new ApiError(401, "Invalid user password");
    }
    const { accessToken, refreshToken } = await generateRefreshAndAccessToken(user._id);


    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    const options = {
        httpOnly: true,
        secure: true,

    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in Successfully"
            )
        );
})

const logoutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out Successfully")
        )
})

export {
    registerUser,
    loginUser,
    logoutUser
}