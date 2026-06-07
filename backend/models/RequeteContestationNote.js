const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RequeteContestationNote = sequelize.define('RequeteContestationNote', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      references: { model: 'Requetes', key: 'id' },
    },
    matiere: { type: DataTypes.STRING(100), allowNull: false },
    noteContestee: { type: DataTypes.FLOAT, allowNull: false },
    noteCorrigee: { type: DataTypes.FLOAT, allowNull: true },
    motifContestation: { type: DataTypes.TEXT, allowNull: false },
    decisionDepartement: { type: DataTypes.TEXT, allowNull: true },
  }, { tableName: 'RequeteContestationNotes', timestamps: false });

  RequeteContestationNote.associate = (models) => {
    RequeteContestationNote.belongsTo(models.Requete, { foreignKey: 'id', as: 'requete' });
  };

  return RequeteContestationNote;
};
