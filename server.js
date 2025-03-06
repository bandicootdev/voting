const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const dotenv = require('dotenv');
const path = require('path');
const flash = require('connect-flash');

dotenv.config();
require('./config/passport'); // Configuración de autenticación

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const voteRoutes = require('./routes/vote');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Error conectando a MongoDB:', err));
app.set('trust proxy', 1);
// Configuración de sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 🔥 Sesión expira en 24 horas (en milisegundos)
    secure: true, // ⚠️ Si usas HTTPS, cambia esto a true
    httpOnly: true
  }
}));

app.use(flash());
app.use(express.static('public'));

// Inicialización de Passport
app.use(passport.initialize());
app.use(passport.session());

// Configuración del motor de plantillas
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/vote', voteRoutes);
app.use('/dashboard', dashboardRoutes);



app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
      return res.redirect('/dashboard'); // Si ya está autenticado, lo redirige a su Dashboard
    }
    res.render('index', { title: 'Bienvenido', user: req.user });
  });
  

app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.error = req.flash('error') || '';
    next();
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
