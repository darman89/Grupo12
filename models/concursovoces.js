'use strict';
module.exports = (sequelize, DataTypes) => {
  const ConcursoVoces = sequelize.define('ConcursoVoces', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: sequelize.fn('gen_random_uuid'),
    },
    id_concurso: DataTypes.UUID,
    id_voz: DataTypes.UUID
  }, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'ConcursoVoces'
  });
  ConcursoVoces.associate = function(models) {
    // associations can be defined here
  };
  return ConcursoVoces;
};
