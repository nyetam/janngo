const { execSync } = require('child_process');
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

// Exécuter les migrations automatiquement au démarrage
try {
  console.log('🔄 Exécution des migrations...');
  execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
  console.log('✅ Migrations terminées');
} catch (err) {
  console.error('❌ Erreur migrations:', err.message);
}

// Exécuter les seeders (silencieux si déjà exécutés — comportement normal au redémarrage)
try {
  execSync('npx sequelize-cli db:seed:all', { stdio: 'pipe' });
  console.log('✅ Seeders appliqués');
} catch {
  // Les seeders ont déjà été insérés — aucune action requise
}

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion PostgreSQL établie');

    await sequelize.sync({ alter: false });
    console.log('✅ Modèles synchronisés');

    app.listen(PORT, () => {
      console.log(`🚀 Janngo API démarrée sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erreur démarrage serveur:', error);
    process.exit(1);
  }
}

startServer();