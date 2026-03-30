import { createYoga } from "graphql-yoga";
import { schema } from "./graphql/schema.ts";

export interface CreateYogaServerOptions {
  graphiql?: boolean;
  graphqlEndpoint?: string;
}

export function createYogaServer(options: CreateYogaServerOptions = {}) {
  return createYoga({
    schema,
    graphiql: options.graphiql ?? false,
    graphqlEndpoint: options.graphqlEndpoint ?? "/graphql",
    cors: {
      origin: "*",
      credentials: false,
    },
  });
}
