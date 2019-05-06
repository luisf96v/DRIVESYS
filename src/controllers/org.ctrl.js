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
                res.sendStatus(200)
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

    findById : (req, res) => 
        Org.findOne({_id: req.params.id})
        .select({'name': 1, 'host': 1, 'root': 1, 'dump': 1, 'admin': 1})
        .exec()
        .then(d => res.send(d)) 
        .catch(_ => res.sendStatus(500)),

    findAll : (_, res) => 
        Org.find({})
            .then(d => res.send(d)) 
            .catch(_ => res.sendStatus(500))
    
}

module.exports = OrgCtrl