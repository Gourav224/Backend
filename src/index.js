import dotenv from 'dotenv'
import connectDB from "./db/index.js";


dotenv.config({
    path:'./env',
})
// require('dotenv').config()



connectDB();

/*
import { DB_NAME } from "./constants";

const app = express();

(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        app.on('error', (error) => {
            console.error('Error connecting', error);
            throw error;
        });
        app.listen(process.env.PORT,()=>{
            console.log('listening on port', process.env.PORT);
        });

    } catch (error) {
        console.error("Error :", error);
        throw error;
    }
}


) ()*/