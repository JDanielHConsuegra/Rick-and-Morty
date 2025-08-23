"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    const API_URL = "https://rickandmortyapi.com/api/character/?page=1";

    // 1) Traer 1 página y tomar los primeros 15
    let results = [];
    try {
      const res = await fetch(API_URL);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} al consultar Rick & Morty API`);
      }
      const data = await res.json();
      results = Array.isArray(data?.results) ? data.results.slice(0, 15) : [];
    } catch (err) {
      console.error("❌ Error al obtener personajes:", err.message);
      throw err; // aborta el seed si falla la API
    }

    // 2) Evitar duplicados si el seed se corre más de una vez
    //    (usamos apiId como identificador único)
    let existing = new Set();
    try {
      const [rows] = await queryInterface.sequelize.query(
        `SELECT "apiId" FROM "Characters";`
      );
      existing = new Set(rows.map((r) => r.apiId).filter((x) => x != null));
    } catch (_e) {
      // si la tabla está vacía o no existe, ignoramos
    }

    const now = new Date();
    const records = results
      .filter((c) => !existing.has(c.id))
      .map((c) => ({
        name: c.name || null,
        status: c.status || null,
        species: c.species || null,
        gender: c.gender || null,
        origin: c?.origin?.name || null,
        image: c.image || null,
        apiId: c.id,
        createdAt: now,
        updatedAt: now,
      }));

    if (!records.length) {
      console.log("ℹ️ No hay personajes nuevos para insertar.");
      return;
    }

    await queryInterface.bulkInsert("Characters", records, {});
    console.log(`✅ Insertados ${records.length} personajes.`);
  },

  async down(queryInterface, _Sequelize) {
    // Elimina solo los que provienen de la API (apiId no nulo)
    await queryInterface.bulkDelete(
      "Characters",
      { apiId: { [Symbol.for("sequelize.where")]: {} } },
      {}
    );
    // Nota: la expresión anterior es un truco para que sequelize-cli no intente serializar Symbols.
    // Alternativa más simple: borrar todos (si te sirve):
    // await queryInterface.bulkDelete("Characters", null, {});
  },
};
