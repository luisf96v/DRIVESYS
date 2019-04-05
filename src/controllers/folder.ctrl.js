const Folder = require('../models/folder')
const FolderCtrl = {}

FolderCtrl.insert = (req, res) => 
    new Folder(req.body)
        .save()
        .then(_ => res.sendStatus(200))
        .catch(_ => res.sendStatus(400))
