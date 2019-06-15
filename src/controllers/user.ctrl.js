const User = require('../models/user')
const Folder = require('../models/folder')
const UserCtrl = {

    findAll: async (req, res) => {
        try {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(await User.find({ org: req.cookies.ouid }).select('name email passr type')))
        } catch (_) { res.sendStatus(500) }
    },

    findByEmail: (req, res) =>
        User.findOne({ email: req.body.email })
            .select('name passr')
            .then(user => {
                if (user) {
                    res.cookie("em", req.body.email)
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                        name: user.name,
                        passr: user.passr
                    }))
                } else {
                    res.status(404).json({ message: 'El usuario no existe!' })
                }
            })
            .catch(_ => res.sendStatus(500)),
    logout: (req, res) => {
        res.cookie("em", "", { expires: new Date(0) });
        res.cookie("muid", "", { expires: new Date(0) });
        res.cookie("ouid", "", { expires: new Date(0) });
        res.sendStatus(200)
    },
    login: (req, res) => {
        console.log(req.cookies.muid)
        if (req.cookies.em && !req.cookies.muid) {
            User.findOne({ 'email': req.cookies.em })
                .select('name email type password org passr')
                .populate('org')
                .then(async data => {
                    if (data && !data.passr) {
                        if (await new User(data).verifyPassword(req.body.password)) {
                            res.cookie("muid", data._id)
                            res.cookie("ouid", data.org)
                            res.clearCookie('em', "", { maxAge: Date.now() })
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ org: data.org, user: { name: data.name, type: data.type } }));
                        } else {
                            res.status(401).json({ 'message': 'Contraseña incorrecta.' })
                        }
                    } else {
                        res.sendStatus(400)
                    }
                })
                .catch(_ => { console.log(_); res.sendStatus(500) })
        } else {
            res.sendStatus(400)
        }
    },

    //findAllByOrg: (req, res) => User.find({"org": req.org}, (_, d) => res.json(d)),

    insert: async (req, res) => {
        try {
            let { name, email, type } = req.body, password = '7QqNXYx?UBbGgqKQHV^Lg8KWL', u = undefined;
            user = await User.findById(req.cookies.muid).select('org type')
            console.log(user)
            switch (user.type) {
                case 1: case 2:
                    u = await new User({ name: name, email: email, type: type == 1 ? 2 : 3, password: password, org: user.org }).save()
                    break
                case 4: case 5:
                    u = await new User({ name: name, email: email, type: type == 1 ? 5 : 6, password: password, org: user.org }).save()
                    break
                default:
                    res.sendStatus(403)
                    return
            }
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ _id: u._id, name: u.name, email: u.email, type: u.type, passr: u.passr }))
        } catch (err) {
            (err.name = 'MongoError' && err.code === 11000)
                ? res.status(400).send({ message: 'Ya existe el usuario con el correo: ' + req.body.email })
                : res.sendStatus(500)
        }
    },

    update: async (req, res) => {
        let { name, email, type } = req.body
        if (req.params.id) {
            try {
                let u = undefined,
                    user = await User.findById(req.cookies.muid).select('org type')
                if ((await User.findById(req.params.id).select('type')).type == 1){
                    if(req.cookies.muid == req.params.id){
                        await User.findOneAndUpdate({ _id: req.params.id }, { name: name, email: email}).exec()
                        u = await User.findById(req.params.id).select('name email type passr')
                    }
                    else
                        res.sendStatus(403)
                }
                else
                    switch (user.type) {
                        case 1: case 2:
                            await User.findOneAndUpdate({ _id: req.params.id }, { name: name, email: email, type: type == 1 ? 2 : 3 }).exec()
                            u = await User.findById(req.params.id).select('name email type passr')
                            break
                        case 4: case 5:
                            await User.findOneAndUpdate({ _id: req.params.id }, { name: name, email: email, type: type == 1 ? 5 : 6 }).exec()
                            u = await User.findById(req.params.id).select('name email type passr')
                            break
                        default:
                            res.sendStatus(403)
                            return
                    }
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ _id: u._id, name: u.name, email: u.email, type: u.type, passr: u.passr }))
            } catch (err) {
                (err.name = 'MongoError' && err.code === 11000)
                    ? res.status(400).send({ message: 'Ya existe el usuario con el correo: ' + req.body.email })
                    : res.sendStatus(500)
            }
            return
        }
        User.findOneAndUpdate({ _id: req.cookies.muid }, { name: name, email: email })
            .then(d => res.sendStatus(200))
            .catch(err => {
                (err.name = 'MongoError' && err.code === 11000)
                    ? res.status(400).send({ message: 'Ya existe el usuario con el correo: ' + req.body.email })
                    : res.sendStatus(500)
            })
    },

    updatePwdReset: async (req, res) => {
        if((await User.findById(req.body.id).select('type')).type == 1&&(await User.findById(req.cookies.muid).select('type')).type!=1)
            res.sendStatus(403)
        else
            User.findOneAndUpdate({ _id: req.body.id }, { passr: true })
            .then(data => {
                if (data) res.sendStatus(200)
                else res.sendStatus(404)
            })
            .catch(_ => res.sendStatus(500))
    },
        

    updatePwd: (req, res) => {
        let qty = (req.cookies.em) ? { "email": req.cookies.em } : { "_id": req.cookies.muid }
        console.log(qty)
        User.findOne(qty)
            .select('name email type org password passr')
            .populate('org')
            .then(async data => {
                if (data) {
                    console.log(data)
                    if (req.cookies.em && req.body.password && data.passr) {
                        await User.findOneAndUpdate({ '_id': data._id }, { password: req.body.password, passr: null })
                        res.cookie("muid", data._id)
                        res.cookie("ouid", data.org)
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ org: data.org, user: { name: data.name, type: data.type } }));
                        return
                    } else if (req.cookies.muid && req.body.password && req.body.oldPassword) {
                        if (await new User(data).verifyPassword(req.body.oldPassword)
                            && await User.findOneAndUpdate({ '_id': data._id }, { password: req.body.password })
                        ) {
                            res.sendStatus(200)
                        } else {
                            res.status(401).json({ 'message': 'Contraseña incorrecta.' })
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
        User.deleteOne({ _id: req.params.id })
            .then(_ => res.sendStatus(200))
            .catch(_ => res.sendStatus(500)),
}
module.exports = UserCtrl