'use strict';
module.exports = (sequelize, DataTypes) => {
  const ConcursoVoces = sequelize.define('ConcursoVoces', {
    id_concurso: DataTypes.INTEGER,
    id_voz: DataTypes.INTEGER
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
