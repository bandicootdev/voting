const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Perfil:', profile); // Debugging
    const email = profile.emails[0].value;
    const emailVerified = profile._json.email_verified; // Asegurar que tomamos el valor correcto

    console.log(`Usuario autenticado: ${email}, Verificado: ${emailVerified}`); // Debugging

    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: email,
        emailVerified: emailVerified, // Guardar estado de verificación
        role: email === process.env.MASTER_EMAIL ? 'master' : 'user'
      });

      await user.save();
    } else {
      // Actualizar si el usuario ya existe
      user.emailVerified = emailVerified;
      await user.save();
    }

    return done(null, user);
  } catch (error) {
    console.error('Error en autenticación:', error);
    return done(error, false);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
      const user = await User.findById(id);
      if (!user) {
          return done(null, false); // 🔥 Si el usuario no existe, destruir la sesión
      }
      done(null, user);
  } catch (error) {
      done(error, false);
  }
});
