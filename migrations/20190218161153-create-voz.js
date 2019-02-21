'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Voces', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_voz_original: {
        allowNull: false,
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'ArchivoVoces',
          key: 'id',
        }
      },
      id_voz_convertida: {
        allowNull: true,
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'ArchivoVoces',
          key: 'id'
        }
      },
      email: {
        type: Sequelize.STRING
      },
      nombre_completo: {
        type: Sequelize.STRING
      },
      fecha_upload: {
        type: Sequelize.DATE
      },
      observacion: {
        type: Sequelize.TEXT
      },
      id_estado: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Estados',
          key: 'id'
        }
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
    return queryInterface.dropTable('Voces');
  }
};
