const express = require('express');
const multer = require('multer');
const Candidate = require('../models/Candidate');

const router = express.Router();

// Configuración de Multer para la subida de imágenes
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Middleware para verificar si el usuario es maestro
const isMaster = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'master') return next();
  res.redirect('/dashboard');
};

// Vista del panel de administración
router.get('/', isMaster, async (req, res) => {
    try {
        const candidates = await Candidate.find();
        res.render('admin', { title: 'Admin', user: req.user, candidates });
      } catch (error) {
        console.error('Error cargando la página de admin:', error);
        res.status(500).send('Error interno del servidor');
      }
});

// Agregar un nuevo candidato
router.post('/add', isMaster, upload.single('image'), async (req, res) => {
  await Candidate.create({
    name: req.body.name,
    description: req.body.description,
    image: req.file.filename
  });
  res.redirect('/admin');
});

module.exports = router;