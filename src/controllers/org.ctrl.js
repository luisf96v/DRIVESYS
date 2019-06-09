const mongoose   = require('mongoose')
const ObjectId  = require('mongoose').Types.ObjectId;
const Org        = require('../models/org')
const User       = require('../models/user')
const Folder     = require('../models/folder')

const OrgCtrl = {

    insert : async (req, res) => {
        let root, dump, org, user
        try{
            // Insertando folders
            let folder = new Folder({name: '_root_' + req.body.org.name})
            root = await folder.save()
            folder = new Folder({name: '_dump_' + req.body.org.name})
            dump = await folder.save()
            //Insertando Org
            org = req.body.org
            org.root = root._id
            org.dump = dump._id
            console.log(1)
            org = await Org.create(org)
            console.log(2)
            //Insertando user
            user = req.body.admin
            user.org = org._id
            user.type = (org.host)? 1: 4
            user = await new User(user).save()
            //Modificando org
            await Org.findOneAndUpdate({_id: org._id}, {admin: user._id})
            root.org = org._id
            dump.org = org._id
            await Folder.findOneAndUpdate({_id: root._id}, root)
            if( await Folder.findOneAndUpdate({_id: dump._id}, dump) )
                Org.findOne({_id: org._id})
                    .select('admin name enabled')
                    .populate('admin')
                    .then(d => res.send(d))
        }catch(err){
            if(root && root._id){
                Folder.findOneAndDelete({_id: root._id}).exec()
            }       
            if(dump && dump._id){
                Folder.findOneAndRemove({_id: dump._id}).exec()
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
        let pre
        try{
            let {org} = req.body
            pre = await Org
                .findOneAndUpdate({_id: req.params.id}, org)
                .select({"name": 1, "admin": 1})
            if(pre) {
                let {admin} = req.body
                if(admin && admin._id != pre.admin){
                    if(admin._id){
                        await Org.findOneAndUpdate({_id: req.params.id}, {admin: admin._id})
                        await User.findOneAndUpdate({_id: admin._id}, {type: 4})
                        await User.findOneAndUpdate({_id: pre.admin}, {type: 6})
                        res.status(200)       
                    } else {
                        admin.org = pre._id
                        let newAdmin = await new User(admin).save()
                        await Org.findOneAndUpdate({_id: req.params.id}, {admin: newAdmin._id})
                        await User.findOneAndUpdate({_id: pre.admin}, {type: 6})
                        res.status(201) 
                    }
                } else {
                    res.status(200)
                }
                Org.findOne({_id: req.params.id})
                    .select({'name': 1, 'enabled': 1, 'admin': 1})
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
    },

    findOrgById : (req, res) => 
        Org.findOne({_id: req.params.id})
        .select({'name': 1, 'enabled': 1, 'admin': 1, 'dump':1, 'root':1})
        .populate('admin')
        .then(d => res.send(d)) 
        .catch(_ => res.sendStatus(500)),

    findFolderById : (req, res) => 
        Org.findOne({_id: req.params.id})
        .select({'root': 1, 'dump': 1})
        .populate('root dump')
        .then(d => res.send(d)) 
        .catch(_ => res.sendStatus(500)),

    findFolderRootById : async (req, res) => {
        try {
            if (ObjectId.isValid(req.params.id)) {
                let org = await Org.findOne({_id: req.params.id}).select('root')
                if(!(org && org.root)) res.sendStatus(500)
                else {
                    Folder.find({parent: org.root, deleted: false})
                    .then(folders =>
                        res.send({
                            'id': org.root, 
                            'data': folders
                        })
                    )
                }
            } else {
                res.sendStatus(400) 
            }
        }catch(err){
            console.log(err)
            res.sendStatus(500)  
        }
    },

    findFolderDumpById : async (req, res) => {
        try {
            if (ObjectId.isValid(req.params.id)) {
                let org = await Org.findOne({_id: req.params.id}).select('root')
                if(!(org)) res.sendStatus(500)
                else {
                    Folder.find({org: org._id, deleted: true})
                    .then(data => res.send({
                        'id': org.root, 
                        'data': data
                    }))
                }
            } else {
                res.sendStatus(400) 
            }
        }catch(err){
            res.sendStatus(500)  
        }
    },


    findUsersById : (req, res) => 
        User.find({org: req.params.id})
        .select({'name': 1, 'email': 1, 'type': 1, 'passr': 1})
        .then(d => res.send(d)) 
        .catch(_ => res.sendStatus(500)),       
    
    findAll : (_, res) => 
        Org.find({})
        .select({'admin': 1, 'name': 1, 'enabled': 1})
        .populate('admin')
        .then(d => res.send(d))
        .catch(_ => res.sendStatus(500))
    
}

module.exports = OrgCtrl