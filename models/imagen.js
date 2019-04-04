'use strict';
module.exports = (sequelize, DataTypes) => {
  const Imagen = sequelize.define('Imagen', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: sequelize.fn('gen_random_uuid'),
    },
    url_minio: DataTypes.STRING,
    nombre: DataTypes.STRING,
    peso: DataTypes.INTEGER,
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
