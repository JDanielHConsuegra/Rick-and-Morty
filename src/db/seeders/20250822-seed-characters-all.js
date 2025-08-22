"use strict";

// Seeder: importa TODOS los personajes desde la Rick & Morty API
// Requiere Node 18+ (usa global fetch). Ajusta el nombre de la tabla si difiere.
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const TABLE = "Characters"; // Ajusta si tu tabla se llama distinto
    // 1) Limpiar tabla (advertencia: borra filas existentes)
    await queryInterface.bulkDelete(TABLE, null, {});

    // 2) Descargar todas las páginas de la API pública
    const rows = [];
    let url = "https://rickandmortyapi.com/api/character";
    while (url) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Fetch failed ${res.status} ${url}`);
      const data = await res.json();
      const now = new Date();
      for (const c of data.results) {
        rows.push({
          name: c.name ?? null,
          status: c.status ?? null,
          species: c.species ?? null,
          gender: c.gender ?? null,
          origin: c.origin && c.origin.name ? c.origin.name : "unknown",
          image: c.image ?? null,
          apiId: c.id, // evita duplicar en futuras importaciones si usas unique index
          createdAt: now,
          updatedAt: now,
        });
      }
      url = data.info && data.info.next ? data.info.next : null;
    }

    // 3) Insertar en bloque
    if (rows.length) {
      await queryInterface.bulkInsert(TABLE, rows, {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    const TABLE = "Characters";
    await queryInterface.bulkDelete(TABLE, null, {});
  },
};
