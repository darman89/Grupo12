'use strict';
module.exports = (sequelize, DataTypes) => {
  const ArchivoVoz = sequelize.define('ArchivoVoz', {
    url_repo: DataTypes.STRING,
    nombre: DataTypes.STRING,
    peso: DataTypes.STRING,
    extension: DataTypes.STRING
  }, {
    freezeTableName: true,
    tableName: 'ArchivoVoces'
  });
  ArchivoVoz.associate = function(models) {
    // associations can be defined here
  };
  return ArchivoVoz;
};
