const multer = require('multer')
    , { mongo, connection } = mongoose = require('mongoose')
    , crypto = require('crypto')
    , Grid = require('gridfs-stream')
    , path = require('path')
    , GridFsStorage = require('multer-gridfs-storage')
    , File = require('../models/file')
    , Folder = require('../models/folder')
    , ObjectId = require('mongoose').Types.ObjectId;

let gfs

connection.once('open', () => {
    gfs = Grid(connection.db, mongoose.mongo);
    gfs.collection('uploads');
})

const storage = new GridFsStorage({
    url: 'mongodb://127.0.0.1:27017/drive',
    file: (req, file) => {
        return new Promise(async (resolve, reject) => {
            let id
            try {
                let buf = await crypto.randomBytes(16)
                const filename = buf.toString('hex') + path.extname(file.originalname)
                let {org} = await Folder.findOne({_id: req.params.folder}).select('org')
                let record = await File.create({
                    'name': file.originalname,
                    'parent': req.params.folder,
                    'org':org
                })
                id = record._id
                const fileInfo = {
                    _id: record._id,
                    filename: filename,
                    bucketName: 'uploads'
                }
                resolve(fileInfo);
            } catch (err) {
                if (id) {
                    File.deleteOne({ _id: id })
                }
                return reject(err)
            }
        })
    }
})

const FileCtrl = {
    upload : multer({ storage }),

    findFilesByFolderId: async (folder) => {
        let ids = (await Files.find({ parent: folder})).map(f => f._id)
        return await gfs.files.find({ _id: ids }).toArray()
    }
}

module.exports = FileCtrl

