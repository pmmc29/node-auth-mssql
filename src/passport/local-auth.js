const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt-nodejs')

const pool = require('../database');
const poolConnect = pool.connect();

const request = pool.request(); // or: new sql.Request(pool1)

pool.on('error', err => {
    // ... error handler
    console.log(err)
});

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});


passport.use('local', new LocalStrategy({
    usernameField: 'email', //campos name
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {

    await poolConnect;
    try {
        if (req.body.password == '' | req.body.email == '') {
            console.log('Ingrese datos validos! LOGIN')
        } else {
            var currentAccountsData = await request.query(`SELECT id,login,pass,tipo FROM usuarios WHERE login='${username}'`, function (err, result) {
                if (err) {
                    return done(err)
                }
                if (result.recordset[0] == null) {
                    console.log('User not found.');
                    return done(null, false, req.flash('loginMessage', 'User not Found.'));
                } else {
                    bcrypt.compare(password, result.recordset[0].pass, function (err, check) {
                        if (err) {
                            req.flash('loginMessage', 'Wrong password.')
                            console.log('Error while checking password');
                            return done();
                        } else if (check) {
                            return done(null, { //DATOS DEL USUARIO QUE SE MANDA A LA SESSION 'req.user'
                                id: result.recordset[0].id,
                                email: result.recordset[0].login,
                                tipo: result.recordset[0].tipo
                                // pass: result.rows[0].pass
                            });
                        } else {
                            req.flash('loginMessage', 'Datos Incorrectos')
                            return done(null, false);
                        }
                    });
                }
            })
        }
    } catch (e) {
        console.log(e)
        throw (e);
    }
}))