import mongoose from 'mongoose';

const url = process.env.URL || "mongodb+srv://Animesh:7679@cluster0.oxxkg.mongodb.net/?retryWrites=true&w=majority";

const connect = (start) => {
    try {
        mongoose.connect(url, (err) => {

            if (!err) {
                console.log('database connection succeeded ');
                start();
            }
        });
    }
    catch(err) {
        console.log(`something went wrong!!`);
    }
}

export default connect;