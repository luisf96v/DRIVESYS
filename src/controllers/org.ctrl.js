/*
router.get('/:id', ctrl.find)
router.get('/:id/drive', ctrl.findFolder)
router.get('/:id/users', ctrl.findUsers)
router.get('/all', ctrl.findAll)
router.post('/', ctrl.insert)
router.post('/update', ctrl.update)
*/

const Org = require('../models/org')
const User = require('../models/user')
const Folder = require('../models/folder')

const OrgCtrl = {

    insert : (req, res) => {
            let flag = false
            let root = new Folder({name:"_root", user: suid})
            root.save()
                .catch(_ => flag = false)
            211
            let dump = new Folder({name:"_dump", user: suid})
            root.save()
                .catch(_ => {
                    flag = false
                    Folder.deleteOne(org.dump)
                })
            
            if(flag) {
                req.body.org.root = root.id
                req.body.org.dump = dump.id

                let org = new Org(req.body.org)
                org.save()
                    .then(_ => {
                        req.body.user.org = org.id
                        req.body.user.type = 4
                        req.body.user.passr = true
                        req.body.user.password = '__%pHk8ML_q?bYK>@3'
                        let user = new User(req.body.user)
                        user.save()
                            .then(_ =>  res.sendStatus(200))
                            .catch(err => { 
                                Org.deleteOne(org.id)
                                Folder.deleteOne(dump.id)
                                Folder.deleteOne(root.id)
                                (err.name = 'MongoError' && err.code === 11000)
                                ? res.status(400).send({message: 'Ya existe el usuario con el correo: ' + req.body.user.email})
                                : res.sendStatus(500)
                            })
                        })
                    .catch(err => { 
                        Folder.deleteOne(dump.id)
                        Folder.deleteOne(root.id)
                        (err.name = 'MongoError' && err.code === 11000)
                        ? res.status(400).send({message: 'Ya existe la organización con el nombre: ' + req.body.org.name})
                        : res.sendStatus(500)
                    })
            } else {
                res.sendStatus(500)
            }
        } else {
            res.sendStatus(401)
        }
    }, 

    update :  (req, res) =>{
        let suid = req.cookies.suid
        let allowed = false
        if(suid) 
            User.findById(suid)
                .then(u => allowed = u.type < 2)
                .catch()   
        
        if(allowed) {
            Folder.findByIdAndUpdate(req.params.folderId, req.body, {upsert:false})
                res.sendStatus(200)
                res.catch(err => {
                (err.name = 'MongoError' && err.code === 11000)
                    ? res.status(400).send({message: 'Ya existe la organización con el nombre: ' + req.body.name})
                    : res.sendStatus(500)
                })
        } else {
            res.sendStatus(401)
        }
    },

    findNames : (req, res) => {
        let suid = req.cookies.suid
        let allowed = false
        if(suid) 
            User.findById(suid)
                .then(u => allowed = u.type < 3)
                .catch()

        if(allowed) {
            Folder.find({})
                .then(data => res.status(200).send(data))
                .catch(_ => res.sendStatus(500))
        } else {
            res.sendStatus(401)
        }
    },

    findById : (req, res) => {
        let suid = req.cookies.suid
        let allowed = false
        if(suid) 
            User.findById(suid)
                .then(u => allowed = u.type < 3)
                .catch()

        if(allowed) {
            Folder.findById(req.params.folderId)
                .select('+root +dump')
                .then(data => res.status(200).send(data))
                .catch(_ => res.sendStatus(500))
        } else {
            res.sendStatus(401)
        }
    },

    find : (req, res) => {
        console.log(req.params.id)
        if (req.params.id) {
            Org.findById(req.params.id)
            .then(data => res.json(data)) 
            .catch(_ => {console.log(_); res.sendStatus(500)})
        }else{
            res.sendStatus(400)
        }
    }    
}

module.exports = OrgCtrl