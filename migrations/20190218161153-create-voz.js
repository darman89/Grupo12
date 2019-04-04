'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Voces', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.fn('gen_random_uuid'),
      },
      id_voz_original: {
        allowNull: false,
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'ArchivoVoces',
          key: 'id',
        }
      },
      id_voz_convertida: {
        allowNull: true,
        type: Sequelize.UUID,
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
