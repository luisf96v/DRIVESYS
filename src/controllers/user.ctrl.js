const User = require('../models/user')
const Folder = require('../models/folder')
const UserCtrl = {

    findAll: (_, res) => 
        User.find({})
            .select('name email type org passr')
            .populate('org')
        .then(data => res.send(data))
        .catch(_ => res.sendStatus(500)),
    
    findByEmail: (req, res) => 
        User.findOne({email: req.body.email})
            .select('name passr')
        .then(user => {
            if(user){ 
                res.cookie("em", req.body.email)
                res.send({
                    name: user.name,
                    passr: user.passr
                })
            } else {
                res.sendStatus(404)
            }
        })
        .catch(_ => res.sendStatus(500)),   

    login: (req, res) => {
        if (req.cookies.em && !req.cookies.muid) {
            User.findOne({'email': req.cookies.em})
                .select('name email type password org passr')
            .then(async data => {
                if(data && !data.passr) {
                   if(await new User(data).verifyPassword(req.body.password)){
                        res.cookie("muid", data._id)
                        res.cookie("ouid", data.org)
                        res.clearCookie('em', {maxAge: Date.now()})
                        res.sendStatus(200)
                    } else {
                        res.status(401).json({'message': 'Contraseña incorrecta.'})
                    }
                } else {
                    res.sendStatus(400)
                }
            })
            .catch(_ => {console.log(_); res.sendStatus(500)})
        } else {
            res.sendStatus(400)
        }
    },  

    //findAllByOrg: (req, res) => User.find({"org": req.org}, (_, d) => res.json(d)),

    insert: (req, res) => {
        req.body.password = '7QqNXYx?UBbGgqKQHV^Lg8KWL'
        new User(req.body)
        .save()
        .then(_ => res.sendStatus(200))
        .catch(err => {
            (err.name = 'MongoError' && err.code === 11000)
            ? res.status(400).send({message: 'Ya existe el usuario con el correo: ' + req.body.email})
            : res.sendStatus(500)
        })
    },

    update: (req, res) =>
        User.findOneAndUpdate({_id: req.params.id || req.cookies.muid}, req.body)
        .then(d =>  res.sendStatus(200))
        .catch(err => {
            (err.name = 'MongoError' && err.code === 11000)
            ? res.status(400).send({message: 'Ya existe el usuario con el correo: ' + req.body.email})
            : res.sendStatus(500)
        }), 

    updatePwdReset: (req, res) => 
        User.findOneAndUpdate({_id: req.params.id}, {passr: true})
            .then(data => {
                if(data) res.sendStatus(200)
                else res.sendStatus(404)
            })
            .catch(_ => res.sendStatus(500)),

    updatePwd: (req, res) => {
        let qty = (req.cookies.em)? {"email": req.cookies.em} : {"_id": req.cookies.muid} 
        console.log(qty)
        User.findOne(qty)
            .select('name email type org password passr')
        .then(async data => {
            if(data) {
                console.log(data)
                if (req.cookies.em && req.body.password && data.passr){
                    await User.findOneAndUpdate({'_id': data._id}, {password: req.body.password, passr: null})
                    res.cookie("muid", data._id)
                    res.cookie("ouid", data.org)
                    //res.cookie("em")
                    res.sendStatus(200)
                } else if(req.cookies.muid && req.body.password && req.body.oldPassword){
                    if( await new User(data).verifyPassword(req.body.oldPassword)
                    &&  await User.findOneAndUpdate({'_id': data._id}, {password: req.body.password})
                    ){
                        res.sendStatus(200)
                    } else {
                        res.status(401).json({'message': 'Contraseña incorrecta.'})
                    }
                } else {
                    res.sendStatus(400)
                }
            } else {
                res.sendStatus(401)
            }
        })
        .catch(_ => res.sendStatus(500))
    },

    delete: (req, res) => 
        User.deleteOne({_id: req.params.id})
            .then(_ => res.sendStatus(200))
            .catch(_ => res.sendStatus(500)),    
}
module.exports = UserCtrl