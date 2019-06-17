const ObjectId = require('mongoose').Types.ObjectId;
const Folder = require('../models/folder')
const User = require('../models/user')
const Org = require('../models/org')

const FolderCtrl = {

    insert: async (req, res) => {
        let folder
        try {
            if (ObjectId.isValid(req.params.id) 
            && (folder = await Folder.findOne({ _id: req.params.id }).select('org'))
            ) {
                req.body.org = folder.org
                req.body.parent = req.params.id
                req.body.date = Date.now
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
            if (err.name === 'MongoError' && err.code === 11000) {
                res.status(400).send({
                    message: 'Ya existe el folder con el nombre: ' + req.body.name
                })
            } else {
                res.sendStatus(500)
            }
        }
    },

    findAllById: async (req, res) => {
        let folder
        try {
            if (ObjectId.isValid(req.params.id) &&
                (folder = await Folder
                    .findOne({ _id: req.params.id })
                    .select('name parent date org')
                    .populate('parent')
                )
            ) {
                if (!req.params.type) {
                    folders = await Folder.find({ parent: req.params.id, deleted: false })
                }
                else if (!folder.parent) {
                    folders = await Folder.find({ org: folder.org, deleted: true })
                }
                else {
                    folders = await Folder.find({ parent: req.params.id })
                }
                res.send({
                    '_id': folder._id,
                    'name': folder.name,
                    'parent': folder.parent,
                    'date': folder.date,
                    'data': folders
                })
                return
            } else {
                res.sendStatus(400)
            }
        } catch (err) {
            res.sendStatus(500).json(err)
        }
    },

    update: async (req, res) => {
        let folder, { parent } = req.body
        try {
            if (req.body.org || req.body.org == '') {
                res.sendStatus(403)
            } else {
                if (ObjectId.isValid(req.params.id) &&
                    (folder = await Folder.findOne({ _id: req.params.id }).select('org'))
                ) {
                    if (parent && ObjectId.isValid(parent) &&
                        (parent = await Folder.findOne({ _id: parent }).select('org')
                        )) {
                        req.date = Date.now
                        Folder.updateOne({ _id: req.params.id }, req.body)
                            .then(_ => res.sendStatus(200))
                            .catch(_ => res.sendStatus(500))
                    } else {
                        if (parent) {
                            res.sendStatus(400)
                        } else {
                            Folder.findOneAndUpdate({ _id: req.params.id }, req.body)
                                .then(updated =>
                                    res.send({
                                        _id: updated._id,
                                        name: req.body.name ? req.body.name : updated.name,
                                        date: req.date
                                    }))
                        }
                    }
                } else {
                    res.sendStatus(403)
                }
            }
        } catch (err) {
            if (err.name === 'MongoError' && err.code === 11000) {
                res.status(400).send({
                    message: 'Ya existe el folder con el nombre: ' + folder.name
                })
            } else {
                res.sendStatus(500)
            }
        }
    },

    restore: async (req, res) =>{
        co = 0
        try{
            folder = await Folder.findById(req.params.id).select('parent')
            if(folder){
                parent = await Folder.findById(folder.parent).select('deleted')
                if(parent && !parent.deleted){
                    Folder.findByIdAndUpdate(folder._id, {deleted: false}).then(()=>res.sendStatus(202))
                    return
                }
                org = Org.findById(folder.org).select('root')
                stuffRoot = await Folder.find({parent: org.root})
                if(!stuffRoot.some(e=>e.name==folder.name))
                    Folder.findByIdAndUpdate(folder._id,{parent: org.root, deleted: false}).then(()=>res.sendStatus(202))
                else
                    res.status(400).send({message: 'Ya existe una carpeta con el mismo nombre en el destino!'})
                return
            }
            res.sendStatus(404)
        } catch (err) {
            res.sendStatus(500).json(err)
        }
    },

    delete: (req, res) => {
        try {
            if (!req.params.type)
                Folder.findByIdAndUpdate(req.params.id, { deleted: true })
                    .then(() => {
                        res.sendStatus(202)
                    })
            else{
                Folder.findById(req.params.id).then(async folder=>{
                    FolderCtrl.deleteChilds(await Folder.find({parent: folder._id}))
                    Folder.deleteOne({_id: folder._id}).exec()
                }).then(()=>res.sendStatus(202))
            }
        }
        catch (err) {
            console.log(err)
            res.sendStatus(500)
        }
    },

    deleteChilds: async collection =>{
        if(collection.length){
            collection.forEach(async e=>{
                try{
                    current = await Folder.findById(e.id)
                    FolderCtrl.deleteChilds(await Folder.find({parent: current._id}))
                    Folder.deleteOne({_id: current._id}).exec()
                }catch(err){
                    throw err
                }
            })
        }
    }
}

module.exports = FolderCtrl