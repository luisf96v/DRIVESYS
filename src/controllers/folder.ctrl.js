const ObjectId  = require('mongoose').Types.ObjectId;
const Folder    = require('../models/folder')
const User      = require('../models/user')
const Org       = require('../models/org')

const FolderCtrl = {

    insert : async (req, res) => {
        let folder
        try {
            if (ObjectId.isValid(req.params.id) &&
               (folder = await Folder.findOne({_id: req.params.id}).select('org'))
            ){
                req.body.org = folder.org
                req.body.parent = req.params.id
                let inserted = await new Folder(req.body).save()
                res.send({
                    _id: inserted._id, 
                    name: inserted.name,
                    date: inserted.date,
                })
            } else {
                res.sendStatus(400)
            }
        } catch (err) {
            if(err.name === 'MongoError' && err.code === 11000){
                res.status(400).send({
                    message: 'Ya existe el folder con el nombre: ' + req.body.name
                })
            } else {
                res.sendStatus(500)
            }
        }
    },

    findById : (req, res) => {
        if (ObjectId.isValid(req.params.id)) {
            Folder.findOne({_id: req.params.id})
                .select('name date parent org')
                .populate('parent')
                .then(folder => res.send(folder))
                .catch(_ => res.sendStatus(500))
        } else {
            res.sendStatus(400)
        }
    },

    findAllById : async (req, res) => {
        let folder
        try {
            if  (ObjectId.isValid(req.params.id) &&
                (folder = await Folder
                    .findOne({_id: req.params.id})
                    .select('name parent date')
                    .populate('parent')
                )
            ){
                Folder.find({parent: req.params.id})
                    .then(folders => res.send({
                        '_id': folder._id,
                        'name': folder.name,
                        'parent': folder.parent,
                        'date': folder.date,                        
                        'data': folders
                    }))
                    .catch(_ => res.sendStatus(500))
            } else {
                res.sendStatus(400)
            }
        }catch (err) {
            res.sendStatus(500)
        }
    },

    update : async (req, res) => {
        let folder, {parent} = req.body
        try {
            console.log('entro')
            if (req.body.org || req.body.org == ''){
                res.sendStatus(403)
            } else {
                if (ObjectId.isValid(req.params.id) &&
                   (folder = await Folder.findOne({_id: req.params.id}).select('org'))
                ){
                    if (parent && ObjectId.isValid(parent) &&
                       (parent = await Folder.findOne({_id: parent}).select('org')
                    )){
                        req.date = Date.now
                        Folder.updateOne({_id: req.params.id}, req.body)
                            .then(_ => res.sendStatus(200))
                            .catch(_ => res.sendStatus(500))   
                    } else {
                        if (parent) {
                            res.sendStatus(400)
                        } else {
                            Folder.findOneAndUpdate({_id: req.params.id}, req.body)
                                .then(updated => 
                                    res.send({
                                        _id: updated._id, 
                                        name: req.body.name? req.body.name: updated.name,
                                        date: req.date
                                    })) 
                        }
                    }
                } else {
                    res.sendStatus(403)
                }
            }
        } catch(err) {
            if(err.name === 'MongoError' && err.code === 11000){
                res.status(400).send({
                    message: 'Ya existe el folder con el nombre: ' + folder.name
                })
            } else {
                res.sendStatus(500)
            }
        }
    },

    delete : async (req, res) => {
        let folder
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