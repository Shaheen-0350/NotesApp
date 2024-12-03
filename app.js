require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const userModel = require("./models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const noteModel = require("./models/note");
const upload = require("./config/multerconfig");

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.post("/upload", isLoggedIn, upload.single("image"), async function(req, res) {
    let user = await userModel.findOne({email: req.user.email})
    user.profilepic = req.file.filename;
    await user.save();
    await user.populate("notes");
    res.render("profile", {user});
});

app.get("/profile/upload", async function(req, res) {
    res.render("profileUpload");
});
app.get("/", function(req, res) {
    res.render("index");
});

app.post("/register", async function(req, res) {
    let {fname, lname, email, password} = req.body;
    let user = await userModel.findOne({email});

    if(user) {
        res.status(500).send("User already exists!");
    }

    else {
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(password, salt, async function(err, hash) {
                let createdUser = await userModel.create({
                    fname,
                    lname,
                    email,
                    password: hash
                });

                let token = jwt.sign({email: email, userid: createdUser._id}, process.env.JWT_SECRET);
                res.cookie("token", token);
                let user = await userModel.findOne({email});
                await user.populate("notes");
                res.render("profile", {user});
            })
        })
    }


    
});

app.post("/login", async function(req, res) {
    let {email, password} = req.body;
    let user = await userModel.findOne({email});

    if(!user) {
        res.send("Something went wrong!");
    }

    else {
        bcrypt.compare(password, user.password, async function(err, result) {
            if(result) {
                let token = jwt.sign({email: email, userid: user._id}, process.env.JWT_SECRET);
                res.cookie("token", token);
                await user.populate("notes");
                res.render("profile", {user});
            }
            else {
                res.redirect("/");
            }
        })
    }
});

app.post("/create", isLoggedIn, async function(req, res) {
    let {note} = req.body;
    let createdNote = await noteModel.create({
        note,
        user: req.user.userid
    });

    let user = await userModel.findOne({email: req.user.email});
    user.notes.push(createdNote._id);
    await user.save();
    await user.populate("notes");
    res.render("profile", {user});
});

function isLoggedIn(req, res, next) {
    if(req.cookies.token === "") {
        res.redirect("/");
    }
    else {
        let data = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        req.user = data;
        next();
    }
}

app.get("/logout", function(req, res) {
    res.cookie("token", "");
    res.render("index");
});

app.get("/delete/:id", isLoggedIn, async function(req, res) {
    await noteModel.deleteOne({_id: req.params.id});
    let user = await userModel.findOne({email: req.user.email});
    let index = user.notes.indexOf(req.params.id);
    user.notes.splice(index, 1);
    await user.save();
    await user.populate("notes");
    res.render("profile", {user});
});

app.get("/edit/:id", isLoggedIn, async function(req, res) {
    let note = await noteModel.findOne({_id: req.params.id});
    res.render("edit", {note});
});

app.post("/update/:id", isLoggedIn, async function(req ,res) {
    let {note} = req.body;
    let targetNote = await noteModel.findOne({_id: req.params.id});
    targetNote.note = note;
    await targetNote.save();
    let user = await userModel.findOne({_id: req.user.userid});
    await user.populate("notes");
    res.render("profile", {user});
});

app.get("/deleteacc/:id", isLoggedIn, async function(req, res) {
    await userModel.deleteOne({_id: req.params.id});
    await noteModel.deleteMany({user: req.params.id});
    res.cookie("token", "")
    res.redirect("/");
})
app.listen(9000);