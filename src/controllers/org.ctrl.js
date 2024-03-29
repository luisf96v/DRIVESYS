const mongoose   = require('mongoose')
const ObjectId  = require('mongoose').Types.ObjectId;
const Org        = require('../models/org')
const User       = require('../models/user')
const Folder     = require('../models/folder')
const fileCtrl   = require('./file.ctrl')

const OrgCtrl = {

    insert : async (req, res) => {
        let root, org, user
        if(req.body.org && req.body.org.host){
            if(await Org.findOne({host: true}))
                return res.sendStatus(400)
        } 
        try{
            // Insertando folders
            let date = Date.now()
            root = await Folder.create({name: `_root_${date}`})
            //Insertando Org
            org = req.body.org
            org.root = root._id
            org.enabled = true
            org = await Org.create(org)
            //Insertando user
            user = req.body.admin
            user.org = org._id
            user.password = '7QqNXYx?UBbGgqKQHV^Lg8KWL'
            user.type = (org.host)? 1: 4
            user.passr = true
            user = await User.create(user)
            //Modificando org
            await Org.findOneAndUpdate({_id: org._id}, {admin: user._id})
            root.org = org._id
            if(await Folder.findOneAndUpdate({_id: root._id}, root))
                Org.findOne({_id: org._id})
                    .select('admin name enabled')
                    .populate('admin')
                    .then(d => res.send(d))
        } catch(err) {
            console.log(err)
            if(root && root._id){
                Folder.findOneAndDelete({_id: root._id}).exec()
            }       
            if(org && org._id){
                Org.findByIdAndDelete({_id: org._id}).exec()
            } 
            if(user && user._id){
                User.findByIdAndDelete({_id: user._id}).exec()
            }
            if(err.name === 'MongoError' && err.code === 11000){
                (user)? res.status(400).send({message: 'Ya existe el usuario con el correo: ' + user.email})
                : res.status(400).send({message: 'Ya existe la organizacion con el mombre: ' + req.body.org.name})
            }else {
                res.sendStatus(500)
            }
        }
    }, 

    update :  async (req, res) =>{
        let {org} = req.body
        if(org && ObjectId.isValid(req.params.id)){
            try{
                let pre = await Org
                    .findOneAndUpdate({_id: req.params.id}, org)
                    .select('name admin host')
                if(pre) {
                    let {admin} = req.body
                    if (admin && admin._id != pre.admin && !pre.host){
                        if(admin._id){
                            await Promise.all([Org.findOneAndUpdate({_id: req.params.id}, {admin: admin._id}),
                                               User.findOneAndUpdate({_id: admin._id}, {type: 4}),
                                               User.findOneAndUpdate({_id: pre.admin}, {type: 6})])
                            res.status(200)       
                        } else {
                            admin.org = pre._id
                            admin.passr = true
                            admin.password = 'changeThis'
                            let newAdmin = new User(admin).save()
                            await Promise.all([Org.findOneAndUpdate({_id: req.params.id}, {admin: newAdmin._id}),
                                               User.findOneAndUpdate({_id: pre.admin}, {type: 6})])
                            res.status(201) 
                        }
                    } else {
                        res.status(200)
                    }
                    Org.findOne({_id: req.params.id})
                        .select('name enabled admin')
                        .populate('admin')
                        .then(d => res.send(d))  
                } else {
                    res.sendStatus(401) 
                }
            }catch(err){
                if(err.name === 'MongoError' && err.code === 11000){
                    (req.body.org && req.body.org.name)? res.status(400).send({message: 'Ya existe la organizacion con el mombre: ' + req.body.org.name})
                    : res.status(400).send({message: 'Ya existe el usuario con el correo: ' + req.body.admin.email})
                } else {
                    res.sendStatus(500) 
                }
            }    
        } else {
            res.status(400)
        }
    },

    findOrgById : (req, res) => {
        if (ObjectId.isValid(req.params.id)) {
            Org.findOne({_id: req.params.id})
                .select('name enabled admin root')
                .populate('admin')
            .then(d => res.send(d)) 
            .catch(_ => res.sendStatus(500))
        }else {
            res.sendStatus(400) 
        }
    },

    /*findFolderById : (req, res) => {
        if (ObjectId.isValid(req.params.id)) { 
            Org.findOne({_id: req.params.id})
                .select('root dump')
                .populate('root dump')
            .then(d => res.send(d)) 
            .catch(_ => res.sendStatus(500))
        }else {
            res.sendStatus(400) 
        }
    },*/
    findFolderRootById : async (req, res) => {
        try {
            if (ObjectId.isValid(req.params.id)) {
                let org = await Org.findOne({_id: req.params.id}).select('root')
                if(!(org && org.root)) res.sendStatus(500)
                else {
                    let folders = await Promise.all([Folder.find({parent: org.root, deleted: {$not:{$eq:true}}}),
                                                     fileCtrl.findFilesByFolderId(org.root,{$not:{$eq:true}})])
                    res.send({
                        'id': org.root, 
                        'data': folders.flat(1)
                    })
                }
            }
            else res.sendStatus(400)
        }catch(err){
            console.log(err)
            res.sendStatus(500)  
        }
    },

    findFolderDumpById : async (req, res) => {
        try {
            if (ObjectId.isValid(req.params.id)) {
                let org 
                if (org = await Org.findOne({_id: req.params.id}).select('root')) {
                    let folders = await Promise.all([Folder.find({org: org._id, deleted: true}), 
                                                     fileCtrl.findFilesByFolderId(org._id,true)])
                    res.send({
                        'id': org.root, 
                        'data': folders.flat()
                    })
                } else {
                    res.sendStatus(400) 
                }
            } else {
                res.sendStatus(400) 
            }
        }catch(err){
            res.sendStatus(500)  
        }
    },


    findUsersById : (req, res) => {
        if (ObjectId.isValid(req.params.id)) {
            User.find({org: req.params.id})
                .select('name email type passr')
            .then(d => res.send(d)) 
            .catch(_ => res.sendStatus(500))
        } else {
            res.sendStatus(400) 
        }
    },       
    
    findAll : (_, res) => 
        Org.find({host: undefined})
        .select('admin name enabled')
        .populate('admin')
        .then(d => res.send(d))
        .catch(_ => res.sendStatus(500))
    
}

module.exports = OrgCtrl