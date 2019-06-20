const ObjectId = require('mongoose').Types.ObjectId;
const User = require('../models/user')
const Folder = require('../models/folder')
const UserCtrl = {

    findAll: async (req, res) => {
        if (ObjectId.isValid(req.signedCookies.ouid)) {
            User.find({ org: req.signedCookies.ouid, _id: { $not: { $eq: req.signedCookies.muid } } })
                .select('name email passr type')
                .then(data => res.send(data))
                .catch(_ => res.sendStatus(500))
        } else {
            res.sendStatus(400)
        }
    },

    findByEmail: (req, res) =>
        User.findOne({ email: req.body.email})
            .select('name passr org')
            .populate('org', {enabled: 1, name: 1})
            .then(user => {
                if (user && user.org && user.org.enabled) {
                    res.cookie("em", req.body.email, { signed: true })
                    return res.send({
                        name: user.name,
                        passr: user.passr
                    })
                } 
                if(user && user.org && !user.org.enabled){
                    return res.status(401).json({ message: `La organización ${user.org.name} se encuentra desactiva.`})
                }
                return res.status(404).json({ message: 'Email incorrecto.' })
            })
            .catch(_ => res.sendStatus(500)),

    logout: (req, res) => {
        res.cookie("muid", "", { maxAge: 0, overwrite: true })
        res.cookie("ouid", "", { maxAge: 0, overwrite: true })
        res.sendStatus(200)
    },

    login: async (req, res) => {
        try {
            if (req.signedCookies.em) {
                let data = await User.findOne({ 'email': req.signedCookies.em })
                    .select('name email type password org passr')
                    .populate('org')
                if (data && !data.passr) {
                    if (await new User(data).verifyPassword(req.body.password)) {
                        let month = 4 * 7 * 24 * 3600 * 1000
                        res.cookie("muid", data._id, { signed: true, })
                        res.cookie("ouid", data.org._id, { signed: true })
                        res.cookie('em', "", { maxAge: 0, overwrite: true })
                        res.send({ org: data.org, user: { name: data.name, type: data.type } })
                    } else {
                        res.status(401).send({ 'message': 'Contraseña reseteada.' })
                    }
                } else {
                    res.sendStatus(401).send({ 'message': 'Contraseña incorrecta.' })
                }
            } else {
                res.sendStatus(400)
            }
        } catch (err) {
            res.sendStatus(500)
        }
    },

    insert: async (req, res) => {
        try {
            if (ObjectId.isValid(req.signedCookies.muid)) {
                let user = req.body
                let admin = await User
                    .findOne({ _id: req.signedCookies.muid })
                    .select('type org')
                    .lean()
                    .populate('org', 'host')
                if (admin && admin.type !== 3 && admin.type !== 6) {
                    user.password = '7QqNXYx?UBbGgqKQHV^Lg8KWL'
                    let orgType = (admin.org.host) ? 2 : 4
                    let admType = (user.type) ? 0 : 1
                    user.type = orgType + admType
                    user.passr = true
                    user.org = admin.org
                    User.create(user)
                        .then(data => res.send(data))
                } else {
                    res.sendStatus(400)
                }
            } else {
                res.sendStatus(400)
            }
        } catch (err) {
            (err.name = 'MongoError' && err.code === 11000)
                ? res.status(400).send({ message: 'Ya existe el usuario con el correo: ' + req.body.email })
                : res.sendStatus(500)
        }
    },

    update: async (req, res) => {
        try {
            let user = req.body
            if (!req.signedCookies.muid || user.password || user.org || user.passr) {
                res.sendStatus(400)
            } else {
                if(req.params.id && req.params.id != req.signedCookies.muid){

                    let admin = await User.findOne({_id: req.signedCookies.muid}).select('type')
                    let nUser = await User.findOne({_id: req.params.id})
                                    .select('org type passr')
                                    .lean()
                                    .populate('org', 'host')
                    if(admin.type <= nUser.type){
                        let orgType = (nUser.org.host) ? 2 : 4
                        let admType = (user.type) ? 0 : 1
                        user.type = orgType + admType
                        User.updateOne({_id: req.params.id}, user)
                        .then(md => {
                            return md.nModified
                                ? res.send({
                                    _id: nUser._id,
                                    passr: nUser.passr,
                                    email: user.email,
                                    type: user.type,
                                    name: user.name
                                })
                                : res.sendStatus(400)
                        })
                    } else {
                        return res.status(403).send({message: 'No tiene permisos necesarios.'})
                    }
                }else if(!user.type){
                    User.updateOne({_id: req.signedCookies.muid}, user)
                    .then(md => {
                        return res.sendStatus(md.nModified? 200 : 400)
                    })
                } else {
                    return res.sendStatus(400)
                }
            }
        } catch (err) {
            (err.name = 'MongoError' && err.code === 11000)
                ? res.status(400).send({ message: 'Ya existe el usuario con el correo: ' + req.body.email })
                : res.sendStatus(500)
        }        
    },

    updatePwdReset: async (req, res) => {
        try{
           let { type } = await User.findOne({ _id: req.signedCookies.muid }).select('type')
            if (!type || type === 3 || type === 6) {
                res.sendStatus(403)
            } else {
                User.updateOne({ _id: req.body.id, type: { $gt: type } }, { passr: true })
                    .then(data => {
                        data.nModified ? res.sendStatus(200) : res.sendStatus(403)
                    })
                    .catch(_ =>console.log(_) && res.sendStatus(500))
            }
        } catch (err) {
            console.log(err)
            res.sendStatus(500)
        }   
    },


    updatePwd: (req, res) => {
        let qty = (req.signedCookies.muid) ? { "_id": req.signedCookies.muid } : { "email": req.signedCookies.em }
        User.findOne(qty)
            .select('name email type org password passr')
            .populate('org')
            .then(async data => {
                if (data) {
                    if (req.signedCookies.muid && req.body.password && req.body.oldPassword) {
                        if (new User(data).verifyPassword(req.body.oldPassword)
                            && await User.findOneAndUpdate({ '_id': data._id }, { password: req.body.password })
                        ) {
                            res.sendStatus(200)
                        } else {
                            res.status(401).json({ 'message': 'Contraseña incorrecta.' })
                        }
                    } else if (req.signedCookies.em && req.body.password && data.passr
                        && await User.findOneAndUpdate({ '_id': data._id }, { password: req.body.password, passr: false })
                    ) {
                        res.cookie("muid", data._id, { signed: true })
                        res.cookie("ouid", data.org._id, { signed: true })
                        res.cookie('em', "", { maxAge: 0, overwrite: true })
                        res.send({ org: data.org, user: { name: data.name, type: data.type } })
                    } else {
                        res.sendStatus(400)
                    }
                } else {
                    res.sendStatus(401)
                }
            })
            .catch(_ => res.sendStatus(500))
    },

    delete: async (req, res) => {
        if (ObjectId.isValid(req.params.id) && req.params.id != req.signedCookies.muid) {
            let {type}  = await User.findOne({ _id: req.signedCookies.muid }).select('type')
            User.findOneAndDelete({ _id: req.params.id, 'type': { $gte: type } })
                .then(data => data ? res.sendStatus(200) : res.sendStatus(403))
                .catch(_ => res.sendStatus(500))
        } else {
            res.sendStatus(400)
        }
    },
}
module.exports = UserCtrl