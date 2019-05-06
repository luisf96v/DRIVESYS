const Folder = require('../models/folder')
const User = require('../models/user')

const FolderCtrl = {

    insert : (req, res) => 
        new Folder(req.body)
        .save()
        .then(_ => res.sendStatus(200))
        .catch(_ => res.sendStatus(500)),

    edit : (req, res) => 
        Folder.findOneAndUpdate({_id: req.params.id}, req.body, {upsert:false})
        .then(_ => res.sendStatus(200))
        .catch(_ => res.sendStatus(500)),

    findById : (req, res) => {
        Folder.findById(req.params.folderId)
                .then(obj => {
                    User.findById(suid)
                        .then(u => {
                            if(u.type < 3){
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
        return await Files.find({parent: folder.id})
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

