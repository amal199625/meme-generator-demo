const express = require('express');
const path = require('path');
const app = express();

// Dossier contenant les fichiers Angular
app.use(express.static(path.join(__dirname, 'dist/meme-generator')));

// Redirection de toutes les routes vers index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/meme-generator/index.html'));
});

// Démarre le serveur
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Frontend Angular running on port ${PORT}`));
