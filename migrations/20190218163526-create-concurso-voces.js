'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('ConcursoVoces', {
      id: {
        allowNull: false,
        primaryKey: true,
        unique:true,
        defaultValue: Sequelize.UUIDV4,
        type: Sequelize.UUID
      },
      id_concurso: {
        type: Sequelize.UUID,
        foreignKey: true,
        references: {
          model: 'Concursos',
          key: 'id'
        }
      },
      id_voz: {
        type: Sequelize.UUID,
        foreignKey: true,
        references: {
          model: 'Voces',
          key: 'id'
        }
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('ConcursoVoces');
  }
};
