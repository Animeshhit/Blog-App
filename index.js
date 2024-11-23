import express from "express";
import bodyParser from "body-parser";
const app = express();
const PORT = process.env.PORT || "3030";
import cors from "cors";
import fetch from "cross-fetch";
import connect from "./db.js";
import dotenv from "dotenv";
import router from "./routes/route.js";
import hbs from "hbs";
import session from "express-session";
import jwt from "jsonwebtoken";
import { User } from "./model/model.js";

dotenv.config();
app.use(
  cors({
    origin: "*",
  })
);
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use(bodyParser.json());
app.use(express.static("public"));
var sess = {
  secret: "Animesh Kumbhakar",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    maxAge: 120000,
  },
};
if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}
app.use(session(sess));
app.set("view engine", "hbs");
app.use("/", router);

app.get("/auth/register", (req, res) => {
  res.render("register");
});

app.get("/auth/login", (req, res) => {
  res.render("login");
});

app.get("/new_note", (req, res) => {
  try {
    if (req.session.user) {
      var decoded = jwt.verify(req.session.user, "Animesh");
      if (decoded.id) {
        User.findById(decoded.id, function (err, docs) {
          if (err) {
            console.log(err);
            res.redirect("/auth/register");
          } else {
            res.render("new", {
              data: docs,
            });
          }
        });
      } else {
        res.redirect("/auth/login");
      }
    } else {
      res.redirect("/auth/login");
    }
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

connect(() => {
  app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
  });
});
