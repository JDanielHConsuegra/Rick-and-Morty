import { gql } from "@apollo/client";

export const GET_CHARACTERS = gql`
  query ($filter: CharacterFilter, $limit: Int, $offset: Int) {
    characters(filter: $filter, limit: $limit, offset: $offset) {
      id
      name
      species
      image
    }
  }
`;

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
