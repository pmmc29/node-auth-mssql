const express = require('express')
const engine = require('ejs-mate')
const path = require('path')
const morgan = require('morgan')
const passport = require('passport')
const session = require('express-session')
const flash = require('connect-flash')

//initializations
const app = express()
require('./database') //conexion a la bd 
require('./passport/local-auth')

//settings
app.set('views', path.join(__dirname, 'views')) //definir la ruta de views
app.engine('ejs', engine) //motor de plantillas ejs
app.set('view engine', 'ejs')
app.set('port', process.env.PORT || 3000)

//middlewares
app.use(express.json())
app.use(morgan('dev'))
app.use(express.urlencoded({
    extended: false
}))
app.use(session({
    secret: 'mysecrect',
    resave: false,
    saveUninitialized: false
}))
app.use(flash());
app.use(passport.initialize()) //inicializar passport
app.use(passport.session())

app.use((req, res, next) => {
    app.locals.loginMessage = req.flash('loginMessage')
    app.locals.aux = req.flash('aux')
    app.locals.aux2 = req.flash('aux2')
    app.locals.msgRD = req.flash('msgRD')
    app.locals.btn_updatepwd = req.flash('btn_updatepwd')
    app.locals.actualizar = req.flash('actualizar')
    next()
})

//routes
app.use('/', require('./routes/routes'))
app.use('/photos', express.static(__dirname + '/photos'))
app.use('/public', express.static(__dirname + '/public'))

//starting the server
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'))
})

module.exports = app;