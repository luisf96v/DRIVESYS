/*
router.get('/:id', ctrl.find)
router.get('/:id/drive', ctrl.findFolder)
router.get('/:id/users', ctrl.findUsers)
router.get('/all', ctrl.findAll)
router.post('/', ctrl.insert)
router.post('/update', ctrl.update)
*/

const Org = require('../models/org')
const User = require('../models/user')

const OrgCtrl = {}

OrgCtrl.find = (req, res) => {
    console.log(req.params.id)
    if (req.params.id) {
        Org.findById(req.params.id)
           .then(data => res.json(data)) 
           .catch(_ => {console.log(_); res.sendStatus(500)})
    }else{
        res.sendStatus(400)
    }
}

OrgCtrl.insert = (req, res) => {
    if (req.body.user && req.body.org) {
        let org = new Org(req.body.org)
        org.save()
           .then(_ => {
                req.body.user.org = org._id
                req.body.user.type = 3
                new User(req.body.user)
                .save()
                .then(_ => {
                    console.log("---EXITO---------");
                    res.sendStatus(200)
                })
                .catch(_ => {
                    console.log("-------------------------------------------")
                    console.log(_)
                    console.log("-------------------------------------------")
                    Org.deleteOne(org._id)
                    .then(_ => {
                        console.log(_)
                        res.sendStatus(500)
                    })
                    .catch(res.sendStatus(500))
                })
            })
           .catch(res.sendStatus(500)) 
    } else {
        res.sendStatus(400)
    }
}

module.exports = OrgCtrl