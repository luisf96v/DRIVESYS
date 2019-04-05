const express = require('express')
const router = express.Router()

const ctrl = require('../controllers/folder.ctrl')

router.get('/:id', ctrl.find)
router.post('/', ctrl.insert)
router.post('/:id', ctrl.update)
router.delete('/', ctrl.delete)

module.exports = router