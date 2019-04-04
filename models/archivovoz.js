'use strict';
module.exports = (sequelize, DataTypes) => {
  const ArchivoVoz = sequelize.define('ArchivoVoz', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: sequelize.fn('gen_random_uuid'),
    },
    url_repo: DataTypes.STRING,
    nombre: DataTypes.STRING,
    peso: DataTypes.INTEGER,
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
