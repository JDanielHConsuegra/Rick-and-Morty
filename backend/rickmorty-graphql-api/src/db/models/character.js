"use strict";
const { Model } = require("sequelize");

/** @param {import('sequelize').Sequelize} sequelize
 *  @param {import('sequelize').DataTypes} DataTypes
 */
module.exports = (sequelize, DataTypes) => {
  class Character extends Model {
    // Aquí podríamos definir asociaciones en el futuro si hiciera falta
    static associate(models) {
      // No hay relaciones por ahora
    }
  }

  Character.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      species: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      gender: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      origin: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING(512),
        allowNull: true,
      },
      apiId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Character",
      tableName: "Characters",
      timestamps: true,
    }
  );

  return Character;
};
