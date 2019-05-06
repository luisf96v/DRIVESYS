const User = require('../models/user')
const UserCtrl = {

    findAll: (_, res)=> 
        User.find((_, d) => res.json(d)),
    
    login: (req, res) => {
        User.findOne({"email": req.body.email})
        .then(data => {
            if(data) {
                let user = User.create(data)
                let valid = user.verifyPassword(req.body.password)
                if(!valid) {
                    res.sendStatus(403)
                } else {
                    res.cookie("suid", user._id, {HttpOnly: true, expire: 604800000, secure: true})
                    res.cookie("name", user.name, {HttpOnly: true, expire: 604800000, secure: true})
                    res.sendStatus(200)
                }
            } else {
                res.sendStatus(500)
            }
        })
        .catch(_ => res.sendStatus(500))
    },  

    findAllByOrg: (req, res) => User.find({"org": req.org}, (_, d) => res.json(d)),

    insert: (req, res) => 
        new User(req.body)
        .save()
        .then(_ => res.sendStatus(200))
        .catch(err => {
            (err.name = 'MongoError' && err.code === 11000)
            ? res.status(400).send({message: 'Ya existe el usuario con el correo: ' + req.body.email})
            : res.sendStatus(500)
        }),

    update: (req, res) => 
        User.findByIdAndUpdate(req.params.id, req.body)
        .then(res.json)
        .catch(e => {
            console.log(err.name)
            console.log(err.code)
            console.log(err)
            res.sendStatus(500)
        }),
    
    delete: (req, res) => 
        User.findByIdAndDelete(req.params.id, req.body)
        .then(res.json)
        .catch(e => {
            console.log(err.name)
            console.log(err.code)
            console.log(err)
            res.sendStatus(500)
        }),    
}
/*
UserCtrl.insert = (req, res) => 
    new User(req.body)
        .save()
        .then(_ => res.sendStatus(200))
        .catch(_ => res.sendStatus(400))

UserCtrl.findAll = (_, res) => User.find((_, d) => res.json(d))

UserCtrl.findLogin = (req, res) => {
    User.findOne({"email": req.body.email})
    .then(data => {
        if(data) {
            let user = await User.create(data)
            let valid = await user.verifyPassword(req.body.password)
            if(!valid) {
                res.sendStatus(403)
            } else {
                res.cookie("suid", user._id, {HttpOnly: true, expire: 604800000, secure: true})
                res.cookie("name", user.name, {HttpOnly: true, expire: 604800000, secure: true})
                res.sendStatus(200)
            }
        } else {
            res.sendStatus(500)
        }
    })
    .catch(_ => res.sendStatus(500))
}

UserCtrl
*/
module.exports = UserCtrl