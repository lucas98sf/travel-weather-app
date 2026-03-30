import { createYogaServer } from "../../apps/api/src/yoga.ts";

const yoga = createYogaServer({
  graphiql: process.env.CONTEXT === "dev",
  graphqlEndpoint: "/api/graphql",
});

export default async function handler(request: Request) {
  const response = await Promise.resolve(yoga.fetch(request, {}));
  return new Response(response.body, {
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
  });
}
