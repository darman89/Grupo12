'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Concursos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_usuario: {
        type: Sequelize.STRING
      },
      nombre: {
        type: Sequelize.STRING
      },
      id_banner: {
        allowNull: false,
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Imagenes',
          key: 'id'
        }
      },
      url: {
        type: Sequelize.STRING
      },
      url_minio: {
        type: Sequelize.STRING
      },
      fecha_inicio: {
        type: Sequelize.DATE
      },
      fecha_final: {
        type: Sequelize.DATE
      },
      valor: {
        type: Sequelize.STRING
      },
      guion: {
        type: Sequelize.TEXT
      },
      recomendaciones: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Concursos');
  }
};
