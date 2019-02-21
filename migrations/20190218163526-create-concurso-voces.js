'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('ConcursoVoces', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_concurso: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: {
          model: 'Concursos',
          key: 'id'
        }
      },
      id_voz: {
        type: Sequelize.INTEGER,
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
