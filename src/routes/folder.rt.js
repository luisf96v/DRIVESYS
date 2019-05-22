const express = require('express')
const router = express.Router()

const ctrl = require('../controllers/folder.ctrl')

router.post('/:id', ctrl.insert)
router.put('/:id', ctrl.update)
router.delete('/:id', ctrl.delete)

router.get('/:id', ctrl.findById)
router.get('/:id/all', ctrl.findAllById)
//router.post('/:id', ctrl.update)

module.exports = router