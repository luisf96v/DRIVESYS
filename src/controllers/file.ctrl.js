const multer = require('multer')
    , { mongo, connection } = mongoose = require('mongoose')
    , crypto = require('crypto')
    , Grid = require('gridfs-stream')
    , path = require('path')
    , GridFsStorage = require('multer-gridfs-storage')
    , File = require('../models/file')
    , Folder = require('../models/folder')
    , ObjectId = require('mongoose').Types.ObjectId
    , FolderCtrl = require('./folder.ctrl');
let gfs

connection.once('open', () => {
    gfs = Grid(connection.db, mongoose.mongo);
    gfs.collection('uploads');
})

const searchParentTree = async element => (element.parent == null || element.deleted) ? element.deleted || false : searchParentTree(await Folder.findById(element.parent))

const storage = new GridFsStorage({
    url: `mongodb://${global.__MONGO_USER&&global.__MONGO_USER+':'+global.__MONGO_PASS+'@'}127.0.0.1:27017/drive`,
    options: { useNewUrlParser: true },
    file: async (req, file) => {
        console.log(file)
        let id
        try {
            let buf = await crypto.randomBytes(16)
            let { org } = await Folder.findOne({ _id: req.params.folder }).select('org')
            let record = await File.create({
                'name': file.originalname,
                'parent': req.params.folder,
                'date': Date.now(),
                'org': org
            })
            id = record._id
            const fileInfo = {
                id: record._id,
                filename: file.originalname,
                chunkSize: 1024*1024,
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
                return 'Fichero'
        }
    },

    findFilesByFolderId: async (folder, qry) => {
        try{
        let query = (qry == true) ? {org: folder, deleted: true}: qry? { parent: folder, deleted: qry } : { parent: folder }
        let a = await Promise.all((await File.find(query)).map(async file => {
            let { length } = await gfs.files.findOne({ _id: file._id })
            return {
                "_id": file._id,
                "name": file.name || '',
                "date": file.date || Date.now(),
                "type": FileCtrl.getExtention(path.extname(file.name || '')),
                "parent": file.parent,
                "size": length
            }
        }))
        return a
    } catch(err){
        console.log(err)
    }
    },

    getFileStream: async (req, res) => {
        file = await File.findOne({ _id: req.params.id })
        fileBlob = await gfs.files.findOne({ _id: file._id })
        if (!fileBlob) {
            return res.status(404).json({
                responseCode: 1,
                responseMessage: "error"
            });
        }
        if (!req.params.force && fileBlob.length > 1048576 * 3) {
            //res.set('filename', fileBlob.filename)
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

    isUniqueName: async (parent, name) => {
        return (await Promise.all(
            (await File.find({ 'parent': parent }))
                .map(async md => ((await gfs.files.findOne({ '_id': md._id })).filename)))
        ).some(val => val == name)
    },

    update: async (req, res) => {
        let file = req.body
        if (file.length || file.chunkSize || file.mds || file.contentType) {
            return res.sendStatus(400)
        }
        console.log('paso')
        if (ObjectId.isValid(req.params.id) && file.name) {/////////////////optimizar
            try {
                file.date = Date.now()
                File.findOneAndUpdate({ _id: req.params.id }, file).exec()
                fileBlob = await gfs.files.findOne({ _id: new ObjectId(req.params.id)})
                res.set('Content-Type', 'Application/json')
                return res.send({
                    "_id": req.params.id,
                    "name": file.name,
                    "date": file.date,
                    "type": FileCtrl.getExtention(path.extname(file.name)),
                    "size": fileBlob.length
                })
            } catch (e) { 
                console.log(e)
                return res.sendStatus(404) 
            }
            /*gfs.files.update({_id: new ObjectId(req.params.id)}, file, (err, md) => {/////////////////////Se cambia porque cuando se cambia el nombre al archivo en gfs
                console.log(md)                                                        /////////////////////este pierde el link con los chunks puesto que el nombre es el link..
                if(err) return res.sendStatus(500)
                res.send({
                    "_id": md._id,
                    "name":file.name,
                    "date": file.uploadDate,
                    "type": FileCtrl.getExtention(path.extname(data.filename)),
                    //"parent": file.parent/*,
                    "size": data.length
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

    delete: async (req, res) => {///seguridad
        try {
            if (!req.params.permanent)
                File.findByIdAndUpdate(req.params.id, { deleted: true })
                    .then(() => {
                        res.sendStatus(202)
                    })
            else {
                try {
                    gfs.files.deleteOne({_id: new ObjectId(req.params.id)}, (err, result) => {
                        if(err) {
                            res.sendStatus(404)
                        } else {
                            gfs.db.collection('uploads.chunks').deleteMany({files_id:new ObjectId(req.params.id)}, async function(err) {
                                if(err) return res.sendStatus(404)
                                err = await File.deleteOne({ _id: req.params.id }).exec()
                                if (err.ok && err.n) {
                                    res.sendStatus(200)
                                    return
                                }
                                res.sendStatus(404)
                            })
                        }
                    });
                } catch (e) {
                    console.log(e)
                }
            }
        }
        catch (err) {
            console.log(err)
            res.sendStatus(500)
        }
    },


    restore: async (req, res) => {//seguridad
        console.log('fff')
        try {
            file = await File.findById(req.params.id).select('parent org')
            if (file) {
                parent = await Folder.findById(file.parent).select('deleted')
                if (parent && await searchParentTree(parent)) {
                    org = await Org.findById(file.org).select('root')
                    stuffRoot = await Folder.find({ parent: org.root })
                    stuffRoot = stuffRoot.concat(await File.find({ parent: org.root }))
                    if (!stuffRoot.some(e => e.name == file.name))
                        File.findByIdAndUpdate(file._id, { parent: org.root, deleted: undefined }).then(() => res.sendStatus(202))
                    else
                        res.status(400).send({ message: 'Ya existe un fichero con el mismo nombre en el destino!' })
                    return
                }
                if (parent) {
                    File.findByIdAndUpdate(file._id, { deleted: undefined }).then(() => res.sendStatus(202))
                    return
                }
            }
            res.sendStatus(404)
        } catch (err) {
            console.log(err)
            res.status(500).json(err)
        }
    },
    /*restore: async (req, res) => {
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
    }*/
}

module.exports = FileCtrl

