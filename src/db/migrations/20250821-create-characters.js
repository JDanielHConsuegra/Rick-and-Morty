"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Characters", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(50), // alive, dead, unknown (string por flexibilidad)
        allowNull: true,
      },
      species: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      gender: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      origin: {
        type: Sequelize.STRING(255), // guardamos el nombre del origin
        allowNull: true,
      },
      image: {
        type: Sequelize.STRING(512),
        allowNull: true,
      },
      // opcional: id de la API externa para evitar duplicados cuando hagamos el seed
      apiId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addIndex("Characters", ["name"]);
    await queryInterface.addIndex("Characters", ["status"]);
    await queryInterface.addIndex("Characters", ["species"]);
    await queryInterface.addIndex("Characters", ["gender"]);
    await queryInterface.addIndex("Characters", ["origin"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Characters");
  },
};
