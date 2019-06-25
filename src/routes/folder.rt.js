/*
    Folder Route
*/ 

const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/folder.ctrl')

/*
    Router for filder related management.
*/ 

// @route GET /:id
// @desc Creates a new folder with parent :id
router.post('/:id', ctrl.insert)

// @route PUT /:id
// @desc Updates a folder with :id
router.put('/:id', ctrl.update)

// @route PUT /:id/restore
// @desc Restores from dump a folder with :id
router.put('/:id/restore', ctrl.restore)

// @route DELETE /:id/:dump
// @desc if dump Updates deleted folder with :id; else !dump permantly delete the folder :id
router.delete('/:id/:dump?', ctrl.delete)

// @route GET /:id/all/:type?
// @desc Get all folders/files by Id, if Type get files with deleted; else get files !deleted
router.get('/:id/all/:type?', ctrl.findAllById)

// @route PUT /:id
// @desc Updates a new folder with parent :id
router.put('/:id', ctrl.update)

module.exports = router