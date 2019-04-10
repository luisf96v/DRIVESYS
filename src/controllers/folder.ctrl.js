const Folder = require('../models/folder')
const User = require('../models/user')

const FolderCtrl = {

    insert : (req, res) => {
        let suid = req.cookies.suid
        let allowed = false
        if(suid) 
            User.findById(suid)
                .then(u => allowed = u.type < 3)
                .catch()     

        if(allowed) {
            req.body.user = suid
            req.body.activity = 1 
            new Folder(req.body)
                .save()
                .then(_ => res.sendStatus(200))
                .catch(err => { 
                    (err.name = 'MongoError' && err.code === 11000)
                    ? res.status(400).send({message: 'Ya existe la carpeta con el nombre de: ' + req.body.name})
                    : res.sendStatus(500)
                })
        } else {
            res.sendStatus(401)
        }
    },

    edit : (req, res) => {
        let suid = req.cookies.suid
        let allowed = false
        if(suid) 
            User.findById(suid)
                .then(u => allowed = u.type < 3)
                .catch(_ => res.sendStatus(500))     

        if(allowed) {
            req.body.user = suid 
            req.body.activity = 2 
            Folder.findByIdAndUpdate(req.params.folderId, req.body, {upsert:false})
                .then(_ => res.sendStatus(200))
                .catch(_ => res.sendStatus(500)) 
        } else {
            res.sendStatus(401)
        }
    },

    findById : (req, res) => {
        let suid = req.cookies.suid
        if(suid){
            Folder.findById(req.params.folderId)
                .then(obj => {
                    User.findById(suid)
                        .then(u => {
                            if(u.type < 3 && u.org === obj.org){
                                obj.folders = getFolders(req.params.folderId)                            
                                obj.files = getFiles(req.params.folderId)
                                res.status(200).send(obj)
                            } else {
                                res.sendStatus(401)
                        }})
                        .catch(_ => res.sendStatus(500))
                })
                .catch(_ => res.sendStatus(500)) 
        } else {
            res.sendStatus(401)
        }
    },

    getFolders : async (folderId) => {
        return await Folder.find({parent: folder.id})
    },

    getFiles : async (folderId) => {
        return await Folder.find({parent: folder.id})
    },
    
    // falta
    delete : (req, res) => {
        suid = req.cookies.suid
        allowed = false
        if(suid) 
            User.findById(suid)
                .then(u => allowed = u.type < 3)
                .catch()    

        if(allowed) {
            req.body.user = suid 
            req.body.activity = 3 
            Folder.findByIdAndUpdate(req.params.folderId, req.body, {upsert:false})
                .then(_ => res.sendStatus(200))
                .catch(_ => res.sendStatus(500)) 
        } else {
            res.sendStatus(401)
        }
    }
}

