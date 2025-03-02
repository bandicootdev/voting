const express = require('express');
const passport = require('passport');

const router = express.Router();

// Ruta para autenticarse con Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback de autenticación de Google
router.get('/google/callback',
  passport.authenticate('google', {
    successRedirect: '/dashboard',
    failureRedirect: '/'
  })
);

router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
      if (err) {
          console.log('ERROR:', err);
          return next(err);
      }
      req.session.destroy(() => {  // Destruir la sesión completamente
          res.clearCookie('connect.sid'); // Limpiar la cookie de sesión
          return res.redirect('/');  // Redirigir a la página principal y detener la ejecución
      });
  });
});

  
module.exports = router;