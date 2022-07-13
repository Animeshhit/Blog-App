import mongoose from 'mongoose';

const url = process.env.URL;

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
