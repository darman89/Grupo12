'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Agregando Estados
    */
    return queryInterface.bulkInsert('Estados', [
      { descripcion: "En Proceso" },
      { descripcion: "Convertida" },
      { descripcion: "Contratada" }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Estados', null, {});
  }
};

