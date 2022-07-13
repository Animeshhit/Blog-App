import express from "express";
const route = express.Router();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Notes, {
    User
} from "../model/model.js";


let colors = ["bg-red-200", "bg-myPink", "bg-myRed", "bg-myYellow", "bg-myWhite"]

route.get("/delete", (req, res) => {
    try {
        let id = req.query.id;
        if (req.session.user) {
            var decoded = jwt.verify(req.session.user, 'Animesh');
            if (decoded.id) {
                User.findById(decoded.id, function (err, user) {
                    if (err) {
                        res.redirect("/auth/register");
                    } else {
                        Notes.findOneAndDelete({
                            _id: id
                        }, function (err, docs) {
                            if (err) {
                                res.send(err.message);
                            } else {
                                res.redirect("/");
                            }
                        })
                    }
                })

            } else {
                res.redirect("/auth/login")
            }
        } else {
            res.redirect("/auth/login")
        }
    }
    catch(err) {
        res.send(err.message)
    }
})




route.get("/view/:slug",
    (req, res) => {
        let slug = req.params.slug;
        try {
            if (req.session.user) {
                var decoded = jwt.verify(req.session.user, 'Animesh');
                if (decoded.id) {
                    User.findById(decoded.id, function (err, user) {
                        if (err) {
                            res.redirect("/auth/register");
                        } else {
                            Notes.find({
                                slug: slug
                            }, (err, docs) => {
                                if (err) {
                                    res.send(err.message);
                                } else {
                                    res.render("view", {
                                        data: docs[0],
                                        user
                                    })
                                }
                            })
                        }
                    })
                } else {
                    res.redirect("/auth/login")
                }
            } else {
                res.redirect("/auth/login")
            }
        }
        catch(err) {
            res.send(err.message);
        }
    })



route.post("/search-in-private",
    (req,
        res) => {
        try {
            let query = req.body.search;
            if (req.session.user) {
                var decoded = jwt.verify(req.session.user, 'Animesh');
                if (decoded.id) {
                    User.findById(decoded.id, function (err, docs) {
                        if (err) {
                            res.redirect("/auth/register");
                        } else {
                            Notes.find({
                                "$or": [{
                                    "title": {
                                        "$regex": query,
                                        '$options': 'i'
                                    }},
                                    {
                                        "desc": {
                                            "$regex": query,
                                            '$options': 'i'
                                        }}]
                            },
                                (err,
                                    notes) => {
                                    if (err) {
                                        res.send(err.message);
                                    } else {
                                        let note = notes.filter(item => {
                                            if (item.userId != docs._id) return false;
                                            item.date = dateFormater(item.createdAt);
                                            item.color = colors[Math.floor(Math.random() * colors.length)];
                                            return true;
                                        });
                                        res.render("index",
                                            {
                                                user: docs,
                                                data: note
                                            })
                                    }
                                })

                        }
                    })
                }
            } else {
                res.redirect('/auth/login');
            }
        }
        catch(err) {
            res.send(err.message);
        }
    })


route.post("/search-in-public",
    (req, res) => {
        try {
            let query = req.body.search;
            if (req.session.user) {
                var decoded = jwt.verify(req.session.user, 'Animesh');
                if (decoded.id) {
                    User.findById(decoded.id, function (err, docs) {
                        if (err) {
                            res.redirect("/auth/register");
                        } else {
                            Notes.find({
                                "$or": [{
                                    "title": {
                                        "$regex": query,
                                        '$options': 'i'
                                    }},
                                    {
                                        "desc": {
                                            "$regex": query,
                                            '$options': 'i'
                                        }}]
                            },
                                (err,
                                    notes) => {
                                    if (err) {
                                        res.send(err.message);
                                    } else {
                                        let note = notes.filter(item => {
                                            if (item.status != "public") return false;
                                            item.date = dateFormater(item.createdAt);
                                            item.color = colors[Math.floor(Math.random() * colors.length)];
                                            return true;
                                        });
                                        
                                        res.render("public",
                                            {
                                                user: docs,
                                                data: note
                                            })
                                    }
                                });
                        }
                    })
                }
            } else {
                res.redirect('/auth/login');
            }
        }
        catch(err) {
            res.send(err.message);
        }
    })



route.post("/new_notes",
    async (req, res) => {
        try {
            let id = req.query.id;
            if (!id) return;
            let doc = await Notes.create({
                userId: id,
                title: req.body.title,
                desc: req.body.desc,
                content: req.body.content,
                status: req.body.status,
                author: req.query.name
            });
            res.redirect('/');
        }
        catch(err) {
            res.send(err.message);
        }
    })



route.post("/auth/register",
    async (req, res) => {
        try {
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(req.body.password, salt);
            let doc = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: hash
            });
            let token = jwt.sign({
                id: doc._id,
            }, 'Animesh', {
                expiresIn: 3600
            });

            req.session.user = token;
            res.redirect('/');
        }
        catch(err) {
            res.send(err.message);
        }
    })


route.get("/",
    (req, res) => {
        try {
            if (req.session.user) {
                var decoded = jwt.verify(req.session.user, 'Animesh');
                if (decoded.id) {
                    User.findById(decoded.id, function (err, docs) {
                        if (err) {
                            res.redirect("/auth/register");
                        } else {

                            Notes.find({
                                userId: decoded.id
                            }, (err, note)=> {
                               
                                if (err) {
                                    res.send('Server error meri jaan');
                                } else {
                                    let notes = note.map(item => {
                                        item.date = dateFormater(item.createdAt);
                                        item.color = colors[Math.floor(Math.random() * colors.length)];
                                        return item;
                                    });

                                    res.render("index", {
                                        user: docs,
                                        data: notes
                                    })
                                }

                            })
                        }
                    })
                } else {
                    res.redirect("/auth/login");
                }
            } else {
                res.redirect("/auth/login");
            }
        }
        catch(err) {
            res.send(err);
        }
    })
route.post("/auth/login",
    (req, res) => {
        try {
            User.find({
                email: req.body.email
            }, function (err, docs) {
                if (err) {
                    res.redirect("/auth/register");
                } else {
                    if (!docs.length > 0) {
                        return res.redirect("/auth/register");
                    }

                    let passwordMatch = bcrypt.compareSync(req.body.password, docs[0].password);
                    if (passwordMatch) {
                        let token = jwt.sign({
                            id: docs[0]._id,
                        }, 'Animesh', {
                            expiresIn: 3600
                        });
                        req.session.user = token;

                        res.redirect("/");
                    } else {
                        res.send('<h1>Incorrect Password</h1>')
                    }
                }
            })
        }
        catch(err) {
            res.send(err.message);
        }
    })




route.get("/public-notes", (req,
    res) => {
    try {
        Notes.find({
            status: "public"
        },
            (err, note)=> {
                if (err) {
                    res.send('Server error meri jaan');
                } else {
                    if (note.length == 0) {
                        res.render("public", {
                            data: note
                        })

                    }
                    let notes = note.map((item) => {
                        item.date = dateFormater(item.createdAt);
                        item.color = colors[Math.floor(Math.random() * colors.length)];
                        return item;
                    });

                    res.render("public", {
                        data: notes
                    })
                }
            })
    }
    catch(err) {
        res.send(err);
    }
});


let montArry = ['Jan', 'Feb', 'Mar', "Apr", 'May', "Jun", "Jul", 'Aug', "Sep", "Oct", "Nov", "Dec"];

function dateFormater(iso) {
    let date = new Date(iso),
    year = date.getFullYear(),
    month = date.getMonth(),
    dt = date.getDate();
    return (`${dt} ${montArry[month]}, ${year}`);
}

function textFormater(text) {
    var string = text.split(" ")
    var first_line = string.slice(0,
        5).join(" ");
    var second_line = string.slice(6,
        10).join(" ");

    var display_string = first_line + second_line;
    if (string.length > 10) display_string += "...";
    return display_string;
}






export default route;