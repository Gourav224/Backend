
const asyncHandler = (fn) => {

    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((err) => next(err));
    }

}


export { asyncHandler }

// const asyncHandler1 = (fn) => async (err, res, req, next) => {
//     try {
//         await fn(err, res, req, next);

//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message,
//         })
//     }
// }