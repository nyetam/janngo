'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ajouter la colonne motifRejet si elle n'existe pas
    const tableDesc = await queryInterface.describeTable('Documents').catch(() => null);
    if (tableDesc && !tableDesc.motifRejet) {
      await queryInterface.addColumn('Documents', 'motifRejet', {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      });
    }

    // Corriger la valeur par défaut de valide (false → true)
    await queryInterface.changeColumn('Documents', 'valide', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    });

    // Mettre à jour les documents existants qui ont valide=false par défaut → true
    // (uniquement ceux sans motifRejet = ceux créés avant cette migration)
    await queryInterface.sequelize.query(
      `UPDATE "Documents" SET "valide" = true WHERE "valide" = false AND "motifRejet" IS NULL`
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Documents', 'motifRejet');
    await queryInterface.changeColumn('Documents', 'valide', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },
};
