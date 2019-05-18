const ObjectId  = require('mongoose').Types.ObjectId;
const Folder    = require('../models/folder')
const User      = require('../models/user')
const Org       = require('../models/org')
/*
const FolderCtrl = {

    insert : async (req, res) => {
        try {
            if (ObjectId.isValid(req.params.id)) {
                let folder = await Folder.findById({_id: req.params.id}).select('org')
                if (folder) {
                    req.body.org = folder.org
                    req.body.parent = req.params.id
                    new Folder(req.body)
                        .save()
                        .then(_ => res.sendStatus(200))
                } else {
                    res.sendStatus(404)
                }
            } else {
                res.sendStatus(400)
            }
        } catch (err) {
            res.sendStatus(500)
        }
    },

    update : async (req, res) => {
        let {parent} = req.body
        try {
            if(req.body.org){
                res.sendStatus(401)
            } else {
                if(parent){
                    parent = await Folder.findOne({_id: parent}).select("org")
                    before = await Folder.findOne({_id: req.params.id}).select("org")
                    if(parent.org != before.org){
                        Folder.update()
                    }
.                }else{

                }

                let folder = await Folder.findOne({_id: parent})

                if (folder.org != )
                .then()
                Folder.findOneAndUpdate({_id: req.params.id}, req.body)
                    .then(_ => res.sendStatus(200))
            
            }
        } catch(err) {
            res.sendStatus(500)
        }
    },

    delete : async (req, res) => {
        try {
            let folder = await Folder.findById({_id: req.params.id}).select('org')
            if(folder){
                Org.findById({_id: folder.org})
                .then(org => {
                    Folder.findOneAndUpdate({_id: req.params.id}, {org: org.dump})
                    .then(_ => res.sendStatus(200))
                })
            } else {
                res.sendStatus(401)
            }
        } catch (err) {
            console.log(err)
            res.sendStatus(500)
        }
    },

    

/*
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
    }*/
}

module.exports = FolderCtrl