'use strict';
module.exports = (sequelize, DataTypes) => {
  const Concurso = sequelize.define('Concurso', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: sequelize.fn('gen_random_uuid'),
    },
    id_usuario: DataTypes.STRING,
    nombre: DataTypes.STRING,
    id_banner: DataTypes.UUID,
    url: DataTypes.STRING,
    url_minio: DataTypes.STRING,
    fecha_inicio: DataTypes.DATE,
    fecha_final: DataTypes.DATE,
    valor: DataTypes.STRING,
    guion: DataTypes.TEXT,
    recomendaciones: DataTypes.TEXT
  }, {});
  Concurso.associate = function(models) {
    Concurso.belongsTo(models.Imagen, {foreignKey: 'id_banner', targetKey: 'id', as: 'imagen',  onDelete: 'CASCADE',  hooks: true});
    Concurso.belongsToMany(models.Voz, { through: { model: models.ConcursoVoces, unique: false }, foreignKey: 'id_voz' });
  };
  return Concurso;
};
