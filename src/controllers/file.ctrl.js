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
        console.log(file)
        let id
        try {
            let buf = await crypto.randomBytes(16)
            let { org } = await Folder.findOne({ _id: req.params.folder }).select('org')
            let record = await File.create({
                'parent': req.params.folder,
                'org': org
            })
            id = record._id
            const fileInfo = {
                id: record._id,
                filename: file.originalname,
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

    getExtention: (ext) => {
        switch (ext.toLowerCase()) {
            case '.xls': case '.xlsx': case '.xlt':
            case '.xlsm': case '.xlsb': case '.csv':
                return 'Excel'
            case '.docx': case '.docm': case '.dotx':
            case '.dotm': case '.docb': case '.doc':
                return 'Word'
            case '.pptx': case '.ppt': case '.pptm':
                return 'Power Point'
            case '.jpeg': case '.gif': case '.png':
            case '.xls': case '.jpg': case '.tiff':
            case '.psd': case '.raw': case '.ico':
                return 'Imagen'
            case '.tgz': case '.zip': case '.tar':
            case '.rar': case '.7z': case '.tar.gz':
            case '.iso': case '.zip': case '.ace':
            case '.z':
                return 'Compreso'
            case '.pdf': return 'PDF'
            case '.odt': case '.odp':
                return 'Open Office'
            case '.txt': return 'Texto'
            default:
                return 'Archivo'
        }
    },

    findFilesByFolderId: async (folder, qry) => {
        let query = qry ? { parent: folder, deleted: qry } : { parent: folder }
        let a = await Promise.all((await File.find(query)).map(async file => {
            let data = await gfs.files.findOne({ _id: file._id })
            return {
                "_id": file._id,
                "name": data.filename,
                "date": data.uploadDate,
                "type": FileCtrl.getExtention(path.extname(data.filename)),
                "parent": file.parent,
                "size": data.length
            }
        }))
        return a
    },

    getFileStream: async (req, res) => {
        file = await File.findOne({ _id: req.params.fileId })
        fileBlob = await gfs.files.findOne({ _id: file._id })
        if (!fileBlob) {
            return res.status(404).json({
                responseCode: 1,
                responseMessage: "error"
            });
        }
        if(!req.params.force&&fileBlob.length>1048576*3){
            //res.set('filename', fileBlob.filename)
            res.set('downloadable','0')
            res.set('Content-Type', 'text/plain')
            res.send('')
            return
        }
        var readstream = gfs.createReadStream({
            _id: file._id,
            root: "uploads"
        })
        res.set('filename', fileBlob.filename)
        res.set('Content-Type', fileBlob.contentType)
        res.set('Content-Disposition', 'attachment; filename="' + fileBlob.filename + '"');
        readstream.on("error", function(err) { 
            res.end();
        });
        return readstream.pipe(res);
    },

    isUniqueName: async (parent, name) => {
        return (await Promise.all(
            (await File.find({ 'parent': parent }))
            .map(async md => ((await gfs.files.findOne({ '_id': md._id })).filename)))
        ).some(val => val == name)
    },

    update: (req, res) => {
        let file = req.body
        if(file.length || file.chunkSize || file.mds || file.contentType){
            return res.sendStatus(400)
        }
        console.log('paso')
        if(ObjectId.isValid(req.params.id) && file.name){
            file.uploadDate = Date.now()
            file.filename = file.name
            console.log(file)
            gfs.files.update({_id: req.params.id}, file, (err, md) => {
                console.log(md)
                if(err) return res.sendStatus(500)
                res.send({
                    //"_id": md._id,
                    "name":file.name,
                    "date": file.uploadDate,
                    //"type": FileCtrl.getExtention(path.extname(data.filename)),
                    "parent": file.parent/*,
                    "size": data.length*/
                })
            })
            /*.then(md => res.send({
                "_id": md._id,
                "name":file.name,
                "date": data.uploadDate,
                "type": FileCtrl.getExtention(path.extname(data.filename)),
                "parent": file.parent,
                "size": data.length
            }))
            .catch(_ => {
                res.sendStatus(500)
            })*/
        }
        return res.sendStatus(400)
    },

    delete: (req, res) => {
        if (ObjectId.isValid(req.params.id)) {
            FileCtrl.deleteFile((req.params.id, req.params.dump))
        } else {
            res.sendStatus(400)
        }
    },

    deleteFile: (id, dump) => {
        try {
            if (req.params.dump) {
                Folder.findById(req.params.id).then(async folder => {
                    FolderCtrl.deleteChilds(await Folder.find({ parent: folder._id }))
                    Folder.deleteOne({ _id: folder._id }).exec()
                }).then(() => res.sendStatus(202))
            } else {
                gfs.remove({ _id: req.params.id, root: 'uploads' }, async (err, gridStore) => {
                    if (err) {
                        return res.status(404).json({ err: err });
                    }
                    await File.deleteOne({ _id: req.params.id })
                    res.sendStatus(200);
                })
                File.updateOne({ _id: req.params.id }, { deleted: true })
                    .then((d) => {
                        console.log(d)
                        res.sendStatus(202)
                    })
            }
        } catch (err) {
            res.sendStatus(500)
        }
    },

    restore: async (req, res) => {
        try {
            if (ObjectId.isValid(req.params.id) && req.body.name) {
                let file = await File
                    .findOne({ _id: req.params.id })
                    .populate('org')
                    .select('root')
                if (FileCtrl.uniqueName(file.parent, req.body.name)) {
                    if (FileCtrl.uniqueName(file.org.root, req.body.name)) {
                        return res.status(400).send({ message: 'Ya existe una archivo con el mismo nombre en el destino!' })
                    }
                    await gfs.files.updateOne({})
                } 
                res
            } 
            res.sendStatus(404)
        } catch (err) {
            res.sendStatus(500)
        }
    }
}

module.exports = FileCtrl

