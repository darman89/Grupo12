'use strict';
module.exports = (sequelize, DataTypes) => {
  const Imagen = sequelize.define('Imagen', {
    url_minio: DataTypes.STRING,
    nombre: DataTypes.STRING,
    peso: DataTypes.STRING,
    extension: DataTypes.STRING
  }, {
    freezeTableName: true,
    tableName: 'Imagenes'
  });
  Imagen.associate = function(models) {
    // associations can be defined here
  };
  return Imagen;
};
