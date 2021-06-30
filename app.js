const express = require("express");
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const app = express();
const User = require('./models/userSchema')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { requireAuth } = require('./middleware/authMiddleware')

app.use(express.json());
app.use(cookieParser())
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));



const DBURI = "mongodb+srv://peerapong:peerapong123@cluster0.xnoei.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
// const dbURI = "mongodb://localhost:27017/newsDB"
const PORT = process.env.PORT || 4000

mongoose.connect(DBURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(PORT, function () {
            console.log(`Server started on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log(error)
    })

const maxAge = 3 * 24 * 60 * 60
const createToken = (id) => {
    return jwt.sign({ id }, "User's ID", {
        expiresIn: maxAge
    })
}

app.get("/", function (req, res) {
    res.render('home')
})

app.get("/login", function (req, res) {
    res.render('login')
})

app.get("/register" , function (req, res) {
    res.render('register')
})

app.get('/logout', function (req, res) {
    res.cookie('jwt', '', { maxAge: 1 })
    res.redirect('/');
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ error: "User doesn't exist" })

    bcrypt.compare(password, user.password)
        .then((match) => {
            if (!match) {
                return res.status(400).json({ error: "Wrong username and password combination!" })
            } else {
                const token = createToken(user._id)
                res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 })
                res.redirect('/secrets')
            }
        })

})


app.get("/secrets", requireAuth, function (req, res) {
    res.render("secrets")
})

app.post("/register", async function (req, res) {
    const { email, password } = req.body
    console.log(email, password)
    bcrypt.hash(password.toString(), 10).then((hash) => {
        User.create({
            email: email,
            password: hash
        }).then((user) => {
            const token = createToken(user._id)
            res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 })
            res.redirect('/secrets')
            // res.status(200).json({ user: user._id })
        }).catch((err) => {
            if (err) return res.status(400).json({ error: err })
        })
    })
})
