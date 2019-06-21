const ObjectId = require('mongoose').Types.ObjectId;
const Folder = require('../models/folder')
const User = require('../models/user')
const Org = require('../models/org')
const fileCtrl = require('./file.ctrl')

const FolderCtrl = {

    insert: async (req, res) => {
        let folder
        try {
            if (ObjectId.isValid(req.params.id) 
            && (folder = await Folder.findOne({ _id: req.params.id }).select('org'))
            ) {
                req.body.org = folder.org
                req.body.parent = req.params.id
                req.body.date = Date.now()
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
                console.log(err)
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
                //console.log(await fileCtrl.findFilesByFolderId(folder._id))
                if (!req.params.type) {
                    folders = await Folder.find({ parent: req.params.id, deleted: {$not: {$eq: true}}})
                    folders = folders.concat(await fileCtrl.findFilesByFolderId(folder._id, {$not: {$eq: true}}))
                }
                else if (!folder.parent) {
                    folders = await Folder.find({ org: folder.org, deleted: true })
                    folders = folders.concat(await fileCtrl.findFilesByFolderId(folder._id, true))
                }
                else {
                    folders = await Folder.find({ parent: req.params.id })
                    folders = folders.concat(await fileCtrl.findFilesByFolderId(folder._id))
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
            res.status(500).json(err)
        }
    },

    update: async (req, res) => {
        try {
            let folder = req.body
            if(!ObjectId.isValid(req.params.id) || !req.body.name || folder.org || folder.parent || folder.deleted || folder.date){
                return res.sendStatus(400)
            }
            let updated =  Date.now
            Folder.findOneAndUpdate({_id: req.params.id}, {name: req.body.name, date: updated})
            .then(data => {
                if(data){
                    return res.send({
                        _id: req.params.id,
                        name:  req.body.name,
                        parent: data.parent,
                        org: data.org
                    })
                }
                res.sendStatus(404)
            })
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

    restore: async (req, res) => {
        co = 0
        try {
            folder = await Folder.findById(req.params.id).select('parent org')
            if (folder) {
                parent = await Folder.findById(folder.parent).select('deleted')
                if(parent && await FolderCtrl.searchParentTree(parent)){
                    org = await Org.findById(folder.org).select('root')
                    stuffRoot = await Folder.find({ parent: org.root })
                    if (!stuffRoot.some(e => e.name == folder.name))
                        Folder.findByIdAndUpdate(folder._id, { parent: org.root, deleted: undefined }).then(() => res.sendStatus(202))
                    else
                        res.status(400).send({ message: 'Ya existe una carpeta con el mismo nombre en el destino!' })
                    return
                }
                if (parent) {
                    Folder.findByIdAndUpdate(folder._id, { deleted: undefined }).then(() => res.sendStatus(202))
                    return
                }
            }
            res.sendStatus(404)
        } catch (err) {
            res.status(500).json(err)
        }
    },

    searchParentTree: async element => (element.parent == null || element.deleted) ? element.deleted || false : FolderCtrl.searchParentTree(await Folder.findById(element.parent)),

    delete: (req, res) => {///seguridad
        try {
            if (!req.params.type)
                Folder.findByIdAndUpdate(req.params.id, { deleted: true })
                    .then(() => {
                        res.sendStatus(202)
                    })
            else {
                Folder.findById(req.params.id).then(async folder => {
                    FolderCtrl.deleteChilds(await Folder.find({ parent: folder._id }))
                    Folder.deleteOne({ _id: folder._id }).exec()
                }).then(() => res.sendStatus(202))
            }
        }
        catch (err) {
            console.log(err)
            res.sendStatus(500)
        }
    },

    deleteChilds: async collection => {
        if (collection.length) {
            collection.forEach(async e => {
                try {
                    current = await Folder.findById(e.id)
                    FolderCtrl.deleteChilds(await Folder.find({ parent: current._id }))
                    Folder.deleteOne({ _id: current._id }).exec()
                } catch (err) {
                    throw err
                }
            })
        }
    }
}

module.exports = FolderCtrl