import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/fileupload.js";
import { ApiResponse } from "../utils/ApiResponse.js"

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
    let coverImageLocalPath ;

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


export { registerUser }