const multer = require('multer')
    , { mongo, connection } = mongoose = require('mongoose')
    , crypto = require('crypto')
    , Grid = require('gridfs-stream')
    , path = require('path')
    , GridFsStorage = require('multer-gridfs-storage')
    , File = require('../models/file')
    , Folder = require('../models/folder')
    , ObjectId = require('mongoose').Types.ObjectId
    , FolderCtrl = require('./folder.ctrl')

let gfs
connection.once('open', () => {
    gfs = Grid(connection.db, mongoose.mongo)
    gfs.collection('uploads')
})

const searchParentTree = async element => (element.parent == null || element.deleted) ? element.deleted || false : searchParentTree(await Folder.findById(element.parent))

const storage = new GridFsStorage({
    url: `mongodb://${global.__MONGO_USER && global.__MONGO_USER + ':' + global.__MONGO_PASS + '@'}127.0.0.1:27017/drive`,
    options: { useNewUrlParser: true },
    file: async (req, file) => {
        try {
            //let buf = await crypto.randomBytes(24)
            let [prevfile, { org }] = await Promise.all([File.findOne({ name: file.originalname, parent: req.params.folder }), 
                                                         Folder.findOne({ _id: req.params.folder }).select('org')])
            if(prevfile) FileCtrl.deleteById(prevfile._id)
            let record = await File.create({
                'name': file.originalname,
                'parent': req.params.folder,
                'date': Date.now(),
                'org': org
            })
            global.__ARR.get(req.signedCookies.muid).push(record._id)
            const fileInfo = {
                id: record._id,
                filename: file.originalname,
                chunkSize: 1024 * 1024,
                bucketName: 'uploads'
            }
            return fileInfo
        } catch (err) {
            throw err
        }
    }
})

const FileCtrl = {
    upload: multer({ storage }).array('files'),

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
                return 'Fichero'
        }
    },

    findFilesByFolderId: async (folder, qry) => {
        try {
            let query = (qry == true) ? { org: folder, deleted: true } : qry ? { parent: folder, deleted: qry } : { parent: folder }
            let md = (await Promise.all(await File.find(query)))
            let result = md.reduce(async (z, e) => {
                [newz, data] = await Promise.all([z, FileCtrl.getFileById(e.id)])
                if (data && data.length)
                    return newz.concat({
                        "_id": e._id,
                        "name": e.name,
                        "date": e.date,
                        "type": FileCtrl.getExtention(path.extname(e.name)),
                        "parent": e.parent,
                        "size": data.length
                    })
                return newz
            }, [])
            return result
        } catch (err) {
            console.log(err)
            return {}
        }
    },

    getFileById: async (id) => await gfs.files.findOne({ _id: new ObjectId(id) }).catch(_ => console.log(_)),

    getFileStream: async (req, res) => {
        [file, fileBlob] = await Promise.all([File.findOne({ _id: req.params.id }),
                                              gfs.files.findOne({ _id: new ObjectId(req.params.id) })])
        if (!fileBlob) {
            return res.status(404).json({
                responseCode: 1,
                responseMessage: "error"
            });
        }
        if (!req.params.force && fileBlob.length > 1048576 * 3) {
            res.set('downloadable', '0')
            res.set('Content-Type', 'text/plain')
            res.send('')
            return
        }
        var readstream = gfs.createReadStream({
            _id: file._id,
            root: "uploads"
        })
        res.set('filename', file.name)
        res.set('Content-Type', fileBlob.contentType)
        res.set('Content-Disposition', 'attachment; filename="' + file.name + '"');
        readstream.on("error", function (err) {
            res.end();
        });
        return readstream.pipe(res);
    },

    update: async (req, res) => {
        let file = req.body
        if (file.length || file.chunkSize || file.mds || file.contentType) {
            return res.sendStatus(400)
        }
        if (ObjectId.isValid(req.params.id) && file.name) {
            try {
                file.date = Date.now()
                File.findOneAndUpdate({ _id: req.params.id }, file).exec()
                fileBlob = await gfs.files.findOne({ _id: new ObjectId(req.params.id) })
                res.set('Content-Type', 'Application/json')
                return res.send({
                    "_id": req.params.id,
                    "name": file.name,
                    "date": file.date,
                    "type": FileCtrl.getExtention(path.extname(file.name)),
                    "size": fileBlob.length
                })
            } catch (e) {
                return res.sendStatus(404)
            }
        }
        return res.sendStatus(400)
    },

    delete: async (req, res) => {
        try {
            if (!req.params.permanent) {
                await File.findByIdAndUpdate(req.params.id, { deleted: true })
                return res.sendStatus(202)
            }
            gfs.files.deleteOne({ _id: new ObjectId(req.params.id) }, (err, result) => {
                if (err) {
                    return res.sendStatus(404)
                } else {
                    gfs.db.collection('uploads.chunks').deleteMany({ files_id: new ObjectId(req.params.id) }, async function (err) {
                        if (err) return res.sendStatus(404)
                        err = await File.deleteOne({ _id: req.params.id }).exec()
                        if (err.ok && err.n) {
                            return res.sendStatus(200)
                        }
                        return res.sendStatus(404)
                    })
                }
            })
        } catch (err) {
            res.sendStatus(500)
        }
    },

    deleteById: (id) => {
        try {
            gfs.files.deleteOne({ _id: new ObjectId(id) }, (err, result) => {
                if (err) {
                    return
                } else {
                    gfs.db.collection('uploads.chunks')
                        .deleteMany({ files_id: new ObjectId(id) }, async function (err) {
                            if (err) return res.sendStatus(404)
                            err = await File.deleteOne({ _id: id }).exec()
                            return
                        })
                }
            })
        } catch (err) {
            throw err
        }
    },

    restore: async (req, res) => {
        try {
            file = await File.findById(req.params.id).select('parent org')
            if (file) {
                parent = await Folder.findById(file.parent).select('deleted')
                if (parent && await searchParentTree(parent)) {
                    org = await Org.findById(file.org).select('root')
                    stuffRoot = await Promise.all([Folder.find({ parent: org.root }), 
                                                   File.find({ parent: org.root })]).flat(1)
                    if (!stuffRoot.some(e => e.name == file.name))
                        File.findByIdAndUpdate(file._id, { parent: org.root, deleted: undefined }).then(() => res.sendStatus(202))
                    else
                        res.status(400).send({ message: 'Ya existe un fichero con el mismo nombre en el destino!' })
                    return
                }
                if (parent) {
                    return File.findByIdAndUpdate(file._id, { deleted: undefined }).then(() => res.sendStatus(202))
                }
            }
            res.sendStatus(404)
        } catch (err) {
            res.status(500)
        }
    }
}

module.exports = FileCtrl

