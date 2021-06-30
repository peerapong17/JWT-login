const jwt = require('jsonwebtoken')

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt

    if (token) {
        jwt.verify(token, "User's ID", (err, decodedToken) => {
            if (err) {
                console.log(err)
                res.redirect('/')
            } else {
                console.log(decodedToken)
                next()
            }
        })
    } else {
        res.redirect('/')
    }
}

module.exports = { requireAuth }