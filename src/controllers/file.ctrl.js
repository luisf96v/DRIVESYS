const multer = require('multer')
    , { mongo, connection } = require('mongoose')
    , multer = require('multer')
    , grid = require('gridfs-stream')
    , gfs = Grid(connection.db, mongo)
    , gridFsStorage = require('multer-gridfs-storage')
    
    //, singleUpload = multer({ storage: storage }).single('file')

Grid.mongo = mongo


