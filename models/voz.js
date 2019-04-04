'use strict';
module.exports = (sequelize, DataTypes) => {
  const Voz = sequelize.define('Voz', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: sequelize.fn('gen_random_uuid'),
    },
    id_voz_original: DataTypes.UUID,
    id_voz_convertida: DataTypes.UUID,
    email: DataTypes.STRING,
    nombre_completo: DataTypes.STRING,
    fecha_upload: DataTypes.DATE,
    observacion: DataTypes.TEXT,
    id_estado: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    tableName: 'Voces'
  });
  Voz.associate = function(models) {
    Voz.belongsTo(models.Estado, {foreignKey: 'id_estado', targetKey: 'id', as: 'estado'});
    Voz.belongsTo(models.ArchivoVoz, {foreignKey: 'id_voz_original', targetKey: 'id', as: 'voz_original', onDelete: 'CASCADE',  hooks: true});
    Voz.belongsTo(models.ArchivoVoz, {foreignKey: 'id_voz_convertida', targetKey: 'id', as: 'voz_convertida', onDelete: 'CASCADE',  hooks: true});
    Voz.belongsToMany(models.Concurso, { through: { model: models.ConcursoVoces, unique: false }, foreignKey: 'id_concurso' });
  };
  return Voz;
};
