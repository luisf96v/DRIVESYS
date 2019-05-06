const Org = require('../models/org')
const User = require('../models/user')
const Folder = require('../models/folder')

const OrgCtrl = {

    insert : async (req, res) => {
        let root, dump, {org, user} = req.body
        try{
            let folder = new Folder({name: '_root'})
            root = await folder.save()
            folder = new Folder({name: '_dump'})
            dump = await folder.save()
            org.root = root._id
            org.dump = dump._id
            org = await Org.create(org)
            user.org = org._id
            user = await new User(user).save()
            await Org.findOneAndUpdate({_id: org._id}, {admin: user._id})
            root.org = org._id
            dump.org = org._id
            await Folder.findOneAndUpdate({_id: root._id}, root)
            if( await Folder.findOneAndUpdate({_id: dump._id}, dump) )
                Org.findOne({_id: org._id})
                    .select({'admin': 1, 'name': 1})
                    .populate('admin')
                    .then(d => res.send(d))
        }catch(ex){
            if(root){
                Folder.findOneAndRemove({_id: root._id})
            }       
            if(dump){
                Folder.findOneAndRemove({_id: dump._id})
            }  
            if(org){
                Org.findOneAndRemove({_id: org._id}) 
            } 
            if(user){
                User.findOneAndRemove({_id:user._id})
            }
            res.sendStatus(400)
        }
    }, 

    update :  (req, res) =>{
        Org.findOneAndUpdate({_id: req.params.id}, req.body)
        .then(_ => res.sendStatus(200))
        .catch(_ => res.sendStatus(500))        
    },

    findFolderById : (req, res) => 
        Org.findOne({_id: req.params.id})
        .select({'root': 1, 'dump': 1})
        .populate('root dump')
        .then(d => res.send(d)) 
        .catch(_ => res.sendStatus(500)),

    findAll : async (req, res) => {
        try {
            Org.find({})
            .select({'admin': 1, 'name': 1})
            .populate('admin')
            .then(d => res.send(d))
        } catch(ex){
            res.sendStatus(500)
        }
    }
}

module.exports = OrgCtrl