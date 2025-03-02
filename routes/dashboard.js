const express = require('express');
const Candidate = require('../models/Candidate');
const moment = require('moment-timezone'); // Importar moment-timezone para manejar zonas horarias

const router = express.Router();

const VOTING_END_DATE = process.env.VOTING_END_DATE || '2025-03-08T18:00:00';


// Middleware para verificar si el usuario está autenticado
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect('/auth/google');
};

router.get('/', isAuthenticated, async (req, res) => {
    try {
      const candidates = await Candidate.find().sort({ votes: -1 });
  
      // Obtener la zona horaria del usuario desde el navegador (si está disponible)
      const userTimezone = req.headers['x-timezone'] || 'UTC';
      const currentTime = moment().tz(userTimezone);
      const votingEndTime = moment.tz(VOTING_END_DATE, userTimezone);
      
      // Verificar si la votación ha finalizado
      const votingEnded = currentTime.isAfter(votingEndTime);
  
      // Obtener los 3 candidatos con más votos
      const topCandidates = candidates.slice(0, 3);
      const winner = votingEnded ? (candidates.length > 0 ? candidates[0] : null) : null;
  
      console.log(`Votación finalizada: ${votingEnded}`); // Debugging
  
      res.render('dashboard', { 
        title: 'Dashboard', 
        user: req.user, 
        candidates, 
        topCandidates,
        winner,
        votingEnded // 🔥 Ahora la variable está definida y se pasa a la vista
      });
    } catch (error) {
      console.error('Error al cargar el dashboard:', error);
      res.status(500).send('Error interno del servidor');
    }
  });
  
  router.get('/candidate/:id', isAuthenticated, async (req, res) => {
    try {
      const candidate = await Candidate.findById(req.params.id);
  
      if (!candidate) {
        return res.status(404).send('Candidato no encontrado');
      }
  
      // Obtener la zona horaria del usuario
      const userTimezone = req.headers['x-timezone'] || 'UTC';
      const currentTime = moment().tz(userTimezone);
      const votingEndTime = moment.tz(VOTING_END_DATE, userTimezone);
      
      // Determinar si la votación ha terminado
      const votingEnded = currentTime.isAfter(votingEndTime);
  
      console.log(`Candidato: ${candidate.name}, Votación finalizada: ${votingEnded}`); // Debugging
  
      res.render('candidate', { 
        title: candidate.name, 
        user: req.user, 
        candidate, 
        votingEnded // ✅ Ahora la variable se pasa correctamente
      });
    } catch (error) {
      console.error('Error al cargar el candidato:', error);
      res.status(500).send('Error interno del servidor.');
    }
  });
  

module.exports = router;
