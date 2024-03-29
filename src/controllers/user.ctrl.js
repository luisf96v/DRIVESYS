/*
    User Controller
*/
const ObjectId = require('mongoose').Types.ObjectId;
const User = require('../models/user')
const Folder = require('../models/folder')

const UserCtrl = {

    // Find all user
    findAll: (req, res) => {
        if (ObjectId.isValid(req.signedCookies.ouid)) {
            User.find({ org: req.signedCookies.ouid, _id: { $not: { $eq: req.signedCookies.muid } } })
                .select('name email passr type')
                .then(data => data ? res.send(data) : res.sendStatus(400))
                .catch(_ => res.sendStatus(500))
        } else {
            res.sendStatus(400)
        }
    },

    // Find User by ID
    findByID: (req, res) =>
        User.findOne({ _id: req.signedCookies.muid })
            .select('name email type')
            .then(data => {
                if (data)
                    return res.send({
                        'name': data.name,
                        'email': data.email,
                        'type': data.type
                    })
                return res.sendStatus(400)
            })
            .catch(_ => res.sendStatus(500)),

    // Find User By Email
    findByEmail: (req, res) => {
        if (req.body.email) {
            User.findOne({ email: req.body.email.trim() })
                .select('name passr org')
                .populate('org', { enabled: 1, name: 1 })
                .then(user => {
                    if (user && user.org && user.org.enabled) {
                        res.cookie("em", req.body.email, { signed: true, expires: 0, httpOnly: true })
                        return res.send({
                            name: user.name,
                            passr: user.passr
                        })
                    }
                    if (user && user.org && !user.org.enabled) {
                        return res.status(401).send({ message: `La organización ${user.org.name} se encuentra desactiva.` })
                    }
                    return res.status(404).send({ message: 'Email incorrecto.' })
                })
                .catch(_ => res.sendStatus(500))
        } else {
            res.sendStatus(400)
        }
    },

    // Log Out
    logout: (_, res) => {
        res.cookie("muid", "", { maxAge: 0, overwrite: true })
        res.cookie("ouid", "", { maxAge: 0, overwrite: true })
        res.sendStatus(200)
    },

    login: async (req, res) => {
        try {
            if (req.signedCookies.em) {
                let data = await User.findOne({ 'email': req.signedCookies.em })
                    .select('name email type password org passr')
                    .populate('org', 'host')
                if (data && !data.passr) {
                    if (await new User(data).verifyPassword(req.body.password)) {
                        let time = req.body.session ? 4 * 7 * 24 * 3600 * 1000 : 0
                        res.cookie("muid", data._id, { signed: true, expires: time && new Date(Date.now() + time), httpOnly: true })
                        res.cookie("ouid", data.org._id, { signed: true, expires: time && new Date(Date.now() + time), httpOnly: true })
                        res.cookie('em', "", { maxAge: 0, overwrite: true })
                        console.log("WTF")
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
            let user = req.body
            let admin = await User
                .findOne({ _id: req.signedCookies.muid })
                .select('type org')
                .lean()
                .populate('org', 'host')
            if (admin && admin.type !== 3 && admin.type !== 6) {
                user.password = '7QqNXYx?UBbGgqKQHV^Lg8KWL'
                let orgType = (admin.org.host) ? 2 : 5
                let admType = (user.type) ? 0 : 1
                user.type = orgType + admType
                user.passr = true
                user.org = admin.org
                let inserted = await User.create(user)
                return inserted
                    ? res.send(inserted)
                    : res.sendStatus(400)
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
                if (req.params.id && req.params.id != req.signedCookies.muid) {

                    let [admin, nUser] = await Promise.all([User.findOne({ _id: req.signedCookies.muid }).select('type'),
                                                            User.findOne({ _id: req.params.id })])
                        .select('org type passr')
                        .lean()
                        .populate('org', 'host')
                    if (admin.type <= nUser.type) {
                        let orgType = (nUser.org.host) ? 2 : 5
                        let admType = (user.type) ? 0 : 1
                        user.type = orgType + admType
                        let md = await User.updateOne({ _id: req.params.id }, user)
                        return md.nModified
                            ? res.send({
                                _id: nUser._id,
                                passr: nUser.passr,
                                email: user.email,
                                type: user.type,
                                name: user.name
                            })
                            : res.sendStatus(400)
                    }
                    return res.status(403).send({ message: 'No tiene permisos necesarios.' })
                } else if (!user.type) {
                    let md = await User.updateOne({ _id: req.signedCookies.muid }, user)
                    return res.sendStatus(md.nModified ? 200 : 400)
                }
                return res.sendStatus(400)
            }
        } catch (err) {
            (err.name = 'MongoError' && err.code === 11000)
                ? res.status(400).send({ message: 'Ya existe el usuario con el correo: ' + req.body.email })
                : res.sendStatus(500)
        }
    },

    updatePwdReset: async (req, res) => {
        try {
            let { type } = await User.findOne({ _id: req.signedCookies.muid }).select('type')
            if (!type || type === 3 || type === 6) {
                res.sendStatus(403)
            } else {
                User.updateOne({ _id: req.body.id, type: { $gt: type } }, { passr: true })
                    .then(data => {
                        data.nModified ? res.sendStatus(200) : res.sendStatus(403)
                    })
                    .catch(_ => res.sendStatus(500))
            }
        } catch (err) {
            res.sendStatus(500)
        }
    },


    updatePwd: (req, res) => {
        console.log(req.body.password, req.body.oldPassword)
        let qty = (req.signedCookies.muid) ? { "_id": req.signedCookies.muid } : { "email": req.signedCookies.em }
        User.findOne(qty)
            .select('name email type org password passr')
            .populate('org')
            .then(async data => {
                console.log(req.body.password)
                if (data) {
                    if (req.signedCookies.muid && req.body.password && req.body.oldPassword) {
                        if (await new User(data).verifyPassword(req.body.oldPassword)
                            && await User.findOneAndUpdate({ '_id': data._id }, { password: req.body.password })
                        ) {
                            console.log(res.sendStatus(200))
                        } else {
                            res.status(401).json({ 'message': 'Contraseña incorrecta.' })
                        }
                    } else if (req.signedCookies.em && req.body.password && data.passr
                        && await User.findOneAndUpdate({ '_id': data._id }, { password: req.body.password, passr: false })
                    ) {
                        let time = req.body.session ? 4 * 7 * 24 * 3600 * 1000 : 0
                        res.cookie("muid", data._id, { signed: true, expires: time && new Date(Date.now() + time), httpOnly: true })
                        res.cookie("ouid", data.org._id, { signed: true, expires: time && new Date(Date.now() + time), httpOnly: true })
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
            let { type } = await User.findOne({ _id: req.signedCookies.muid }).select('type')
            User.findOneAndDelete({ _id: req.params.id, 'type': { $gte: type } })
                .then(data => data ? res.sendStatus(200) : res.sendStatus(403))
                .catch(_ => res.sendStatus(500))
        } else {
            res.sendStatus(400)
        }
    },
}
module.exports = UserCtrl