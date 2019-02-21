'use strict';
module.exports = (sequelize, DataTypes) => {
  const Estado = sequelize.define('Estado', {
    descripcion: DataTypes.STRING
  }, {
    timestamps: false
  });
  Estado.associate = function(models) {
    // associations can be defined here
  };
  return Estado;
};
