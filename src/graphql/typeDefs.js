// src/graphql/typeDefs.js
const typeDefs = `#graphql
  type Character {
    id: ID!
    name: String!
    status: String
    species: String
    gender: String
    origin: String
    image: String
    apiId: Int
    createdAt: String
    updatedAt: String
  }

  input CharacterFilter {
    status: String
    species: String
    gender: String
    name: String
    origin: String
  }

  input CharacterCreateInput {
    name: String!
    status: String
    species: String
    gender: String
    origin: String
    image: String
    apiId: Int
  }

  input CharacterUpdateInput {
    name: String
    status: String
    species: String
    gender: String
    origin: String
    image: String
    apiId: Int
  }

  type FilterOptions {
    statuses: [String!]!
    species: [String!]!
    genders: [String!]!
    origins: [String!]!
  }

  # ---- Pagination (Relay-style) ----
  type PageInfo {
    endCursor: String
    hasNextPage: Boolean!
  }

  type CharacterEdge {
    node: Character!
    cursor: String!
  }

  type CharacterConnection {
    edges: [CharacterEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type Query {
    hello: String

    characters(
      filter: CharacterFilter
      limit: Int = 20
      offset: Int = 0
    ): [Character!]!

    character(id: ID!): Character

    filterOptions: FilterOptions!

    charactersConnection(
      filter: CharacterFilter
      first: Int = 20
      after: String
    ): CharacterConnection!
  }

  type Mutation {
    createCharacter(input: CharacterCreateInput!): Character!
    updateCharacter(id: ID!, input: CharacterUpdateInput!): Character!
    deleteCharacter(id: ID!): Boolean!
  }
`;
export default typeDefs;
