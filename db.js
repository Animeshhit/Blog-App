import mongoose from "mongoose";
import { config } from "dotenv";
config();

const url = process.env.URL;

const connect = (start) => {
  try {
    mongoose.connect(url, (err) => {
      if (!err) {
        console.log("database connection succeeded ");
        start();
      }
    });
  } catch (err) {
    console.log(`something went wrong!!`);
  }
};

export default connect;
