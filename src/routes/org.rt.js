const express = require('express')
const router = express.Router()

const ctrl = require('../controllers/org.ctrl')

router.get('/:id', ctrl.findFolderById)
router.get('/', ctrl.findAll)
router.post('/', ctrl.insert)
router.put('/:id', ctrl.update)


module.exports = router