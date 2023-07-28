const { Router } = require('express')
const { check } = require('express-validator')
const { validarCampos, validarJWT } = require('../middlewares')

const { login, googleSingIn, renovarToken } = require('../controllers/auth')
const router = Router()

router.post('/login', [
    check('correo','El correo es obligatorio').isEmail(),
    check('password','La contraseña es obligatoria').not().isEmpty(),
    validarCampos
],login)

router.post('/google', [
    check('id_token','Id token necesario').not().isEmpty(),
    validarCampos
], googleSingIn)

router.get('/', validarJWT, renovarToken )
module.exports = router