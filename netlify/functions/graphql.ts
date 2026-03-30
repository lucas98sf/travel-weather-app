import { createYogaServer } from "../../apps/api/src/yoga.ts";

const yoga = createYogaServer({
  graphiql: process.env.CONTEXT === "dev",
  graphqlEndpoint: "/api/graphql",
});

export default function handler(request: Request) {
  return yoga.handle(request, {});
}
