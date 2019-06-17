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
        User.findOne({ email: req.body.email }).select('name passr')
            .then(user => {
                if (user) {
                    res.cookie("em", req.body.email, { signed: true })
                    res.send({
                        name: user.name,
                        passr: user.passr
                    })
                } else {
                    res.status(404).json({ message: 'Email incorrecto.' })
                }
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
            console.log(err)
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
                    .populate('org')
                if (admin && admin.type !== 3 && admin.type !== 6) {
                    user.password = '7QqNXYx?UBbGgqKQHV^Lg8KWL'
                    user.type = ((admin.org.host) ? 2 : 4) + (user.admin) ? 0 : 1
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
            if (ObjectId.isValid(req.params.id) || req.signedCookies.muid) {
                let user = req.body
                if (user.password || user.org || user.passr) {
                    res.sendStatus(400)
                } else {
                    let { org, passr } = await User
                        .findOne({ _id: req.params.id || req.signedCookies.muid })
                        .select('org passr')
                        .lean()
                        .populate('org', 'host')
                    if (org) {
                        user.type = (org.host ? 2 : 4) + (user.admin) ? 0 : 1
                        User.updateOne({ _id: req.params.id || req.signedCookies.muid }, user)
                            .then(d => res.send({
                                _id: req.params.id || req.signedCookies.muid,
                                name: user.name,
                                email: user.email,
                                type: user.type,
                                'passr': passr
                            }))
                    } else {
                        res.sendStatus(400)
                    }
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

    updatePwdReset: async (req, res) => {
        let { type } = await User.findOne({ _id: req.signedCookies.muid }).select('type')
        if (!type || type === 3 || type === 6) {
            res.sendStatus(403)
        } else {
            User.findOneAndUpdate({ _id: req.body.id, type: { $gte: type } }, { passr: true })
                .then(data => {
                    data ? res.sendStatus(200) : res.sendStatus(403)
                })
                .catch(_ => res.sendStatus(500))
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
                        && await User.findOneAndUpdate({ '_id': data._id }, { password: req.body.password, passr: undefined })
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