const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/file.ctrl')

router.post('/upload/:folder', ctrl.upload.array('files'), (req, res)=> {
    res.sendStatus(200)
})

router.get('/:fileId/:force?', ctrl.getFileStream)

router.delete('/:id/:permanet?', ctrl.delete)

router.put('/:id', ctrl.update)

router.get('/', async (req, res)=>{
    console.log(await ctrl.isUniqueName('5d085d11e7a48a3b5c054035', 'Administración de Bases de Datos.pdf'))
    res.sendStatus(200)
})

module.exports = router