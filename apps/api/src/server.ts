import { createServer } from "node:http";
import { createYogaServer } from "./yoga.ts";

const port = Number(process.env.PORT ?? "4000");

const yoga = createYogaServer({
  graphiql: true,
  graphqlEndpoint: "/graphql",
});

const server = createServer(yoga);

server.listen(port, () => {
  console.log(`GraphQL API running at http://localhost:${port}/graphql`);
});
