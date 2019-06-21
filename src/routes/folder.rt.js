const express = require('express')
const router = express.Router()

const ctrl = require('../controllers/folder.ctrl')

router.post('/:id', ctrl.insert)
router.put('/:id', ctrl.update)
router.put('/:id/restore', ctrl.restore)
router.delete('/:id/:dump?', ctrl.delete)

//router.get('/:id', ctrl.findById)
router.get('/:id/all/:type?', ctrl.findAllById)
router.put('/:id', ctrl.update)

module.exports = router