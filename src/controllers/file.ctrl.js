const multer = require('multer')
    , { mongo, connection } = mongoose = require('mongoose')
    , crypto = require('crypto')
    , Grid = require('gridfs-stream')
    , path = require('path')
    , GridFsStorage = require('multer-gridfs-storage')
    , File = require('../models/file')
    , Folder = require('../models/folder')
    , readBlob = require('read-blob')
    , ObjectId = require('mongoose').Types.ObjectId;

let gfs

connection.once('open', () => {
    gfs = Grid(connection.db, mongoose.mongo);
    gfs.collection('uploads');
})

const storage = new GridFsStorage({
    url: 'mongodb://127.0.0.1:27017/drive',
    options: { useNewUrlParser: true },
    file: async (req, file) => {
        let id
        try {
            let buf = await crypto.randomBytes(16)
            console.log(req.files)
            const filename = buf.toString('hex') + path.extname(file.originalname)
            let { org } = await Folder.findOne({ _id: req.params.folder }).select('org')
            let record = await File.create({
                'name': file.originalname,
                'parent': req.params.folder,
                'org': org,
                'date': Date.now(),
                'type': path.extname(file.originalname).slice(1)
            })
            id = record._id
            const fileInfo = {
                id: record._id,
                filename: filename,
                bucketName: 'uploads'
            }
            return fileInfo
        } catch (err) {
            if (id) {
                File.deleteOne({ _id: id })
            }
            throw err
        }
    }
})

const FileCtrl = {
    upload: multer({ storage }),

    findFilesByFolderId: async (folder, deleted = false) => {
        let query = deleted ? { parent: folder, deleted: deleted } : { parent: folder }
        return await Promise.all((await File.find(query)).map(async f => f.size ? f : await File.findOneAndUpdate({ _id: f._id }, { size: (await gfs.files.findOne({ _id: f._id })).length }).exec()))
    },

    getFileStream: async (req, res) => {
        console.log(req.params.fileId)
        file = await File.findOne({_id: req.params.fileId})
        fileBlob = await gfs.files.findOne({ _id: file._id })
        console.log(fileBlob, file)
        if (!fileBlob) {
            return res.status(404).json({
                responseCode: 1,
                responseMessage: "error"
            });
        }
        // create read stream
        var readstream = gfs.createReadStream({
            _id: file._id,
            root: "uploads"
        });
        // set the proper content type 
        res.set('filename', file.name)
        res.set('Content-Type', fileBlob.contentType)
        // Return response
        return readstream.pipe(res);
    }
}

module.exports = FileCtrl

