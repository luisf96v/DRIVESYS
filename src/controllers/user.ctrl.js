const User = require('../models/user')
const UserCtrl = {}

UserCtrl.insert = (req, res) => 
    new User(req.body)
        .save()
        .then(_ => res.sendStatus(200))
        .catch(_ => res.sendStatus(400))

UserCtrl.findAll = (_, res) => 
    User.find((_, d) => res.json(d))

UserCtrl.findLogin = (req, res) => {
    if(req.cookies.suid){
        res.redirect("./index.html")
    } else if (req.body.email && req.body.password){
        User.findOne({"email": req.body.email})
        .then(data => {
            if(data) {
                User.create(data) 
                .then(user => 
                    user.verifyPassword(req.body.password)
                    .then(valid => { 
                    if(!valid) {
                        res.sendStatus(403)
                     } else {
                        console.log(user._id)
                        res.cookie("suid", user._id, {HttpOnly: true, expire: 604800000, secure: true})
                        res.cookie("name", user.name, {HttpOnly: true, expire: 604800000, secure: true})
                        res.sendStatus(200)
                    }})
                    .catch(_ => res.sendStatus(500))
                )
            } else {
                res.sendStatus(500)
            }
        })
        .catch(_ => res.sendStatus(500))
    } else {
        res.sendStatus(400)
    }
}

module.exports = UserCtrl