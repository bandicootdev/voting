const express = require('express');
const fs = require('fs');
const xlsx = require('xlsx');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const moment = require('moment-timezone'); // Importar moment-timezone para manejar zonas horarias


const router = express.Router();

const VOTING_END_DATE = process.env.VOTING_END_DATE || '2025-03-08T18:00:00'; // Usar variable de entorno o un valor por defecto


// Middleware para verificar si el usuario está autenticado
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect('/auth/google');
};


router.post('/:id', isAuthenticated, async (req, res) => {
  try {
    const userTimezone = req.headers['x-timezone'] || 'UTC'; // Obtener la zona horaria del usuario (si está disponible)
    const currentTime = moment().tz(userTimezone);
    const votingEndTime = moment.tz(VOTING_END_DATE, userTimezone);

    // Bloquear votación si ya pasó la fecha límite
    if (currentTime.isAfter(votingEndTime)) {
      req.flash('error', 'La votación ha finalizado.');
      return res.redirect('/dashboard');
    }

    const candidateId = req.params.id;
    const user = await User.findById(req.user._id);
    const candidate = await Candidate.findById(candidateId);

    if (!user || !candidate) {
      req.flash('error', 'Usuario o candidato no encontrado.');
      return res.redirect('/dashboard');
    }

    // Verificar si el usuario ya votó por este candidato
    if (user.votedCandidates.includes(candidateId)) {
      req.flash('error', 'Ya has votado por este candidato.');
      return res.redirect('/dashboard');
    }

    // Registrar el voto
    candidate.votes += 1;
    await candidate.save();

    user.votedCandidates.push(candidateId);
    await user.save();

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error al registrar el voto:', error);
    req.flash('error', 'Error interno del servidor.');
    res.redirect('/dashboard');
  }
});

// Función para guardar el voto en un archivo Excel
const saveVoteToExcel = (user, candidate) => {
  const filePath = './backups/votes.xlsx';

  let workbook;
  let sheetName = 'Votos';
  let data = [];

  // Si el archivo ya existe, cargarlo
  if (fs.existsSync(filePath)) {
    workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[sheetName];
    data = xlsx.utils.sheet_to_json(sheet);
  } else {
    workbook = xlsx.utils.book_new();
  }

  // Agregar nuevo voto a la data
  data.push({
    Fecha: new Date().toISOString(),
    Usuario: user.name,
    Email: user.email,
    Candidato: candidate.name,
    ID_Candidato: candidate._id.toString(),
  });

  // Convertir a hoja de Excel
  const worksheet = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Guardar archivo Excel
  xlsx.writeFile(workbook, filePath);
};

module.exports = router;
