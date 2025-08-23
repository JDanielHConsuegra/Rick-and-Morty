import { gql } from "@apollo/client";

// Ping
export const HELLO = gql`
  query Hello {
    hello
  }
`;

// Lista (incluimos status y gender para que el filtro en cliente funcione)
export const GET_CHARACTERS = gql`
  query ($filter: CharacterFilter, $limit: Int, $offset: Int) {
    characters(filter: $filter, limit: $limit, offset: $offset) {
      id
      name
      status
      species
      gender
      origin
      image
    }
  }
`;

// Detalle
export const GET_CHARACTER_BY_ID = gql`
  query ($id: ID!) {
    character(id: $id) {
      id
      name
      status
      species
      gender
      origin
      image
    }
  }
`;

// Opciones de filtros (valores únicos)
export const GET_FILTER_OPTIONS = gql`
  query {
    filterOptions {
      statuses
      species
      genders
      origins
    }
  }
`;
