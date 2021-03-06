const express = require("express");

const router = express.Router();

const bc = require("bcryptjs");

const jwt = require("jsonwebtoken");

const { jwtSecret } = require("./secret.js");

const Users = require("../user/users-model");

// SIGNUP ENDPOINT
router.post("/register", (req, res) => {
    const user = req.body;
    const hash = bc.hashSync(user.password, 10);
    user.password = hash;
    if (!user.email || !user.password) {
        res.status(400).json({error: "Email and password are required."})
    } else {
        Users.insert(user)
        .then(saved => {
            const email = saved.email;
            Users.getBy({ email })
            .first()
            .then(user => {
                const token = generateToken(user);
                const id = user.id;
                const points = user.points;
                res.status(200).json({token, id, points})
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({error: "Error while signing in."})
    })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({error: "Error while signing up."})
        })
    }
})

router.post("/login", (req, res) => {
    const { email, password } = req.body;
    Users.getBy({ email })
    .first()
    .then(user => {
        if (user && bc.compareSync(password, user.password)) {
            const token = generateToken(user);
            const id = user.id;
            const points = user.points;
            res.status(200).json({token, id, points})
        } else {
            res.status(401).json({error: "Invalid credentials."})
        }
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({error: "Error while signing in."})
    })
})

function generateToken(user) {
    const payload = {
        userId: user.id,
        email: user.email
    };
    const options = {
        expiresIn: "1d"
    };
    return jwt.sign(payload, jwtSecret, options);
}


module.exports = router;