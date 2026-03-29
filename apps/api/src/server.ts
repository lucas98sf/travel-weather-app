import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import { schema } from "./graphql/schema.ts";

const port = Number(process.env.PORT ?? "4000");

const yoga = createYoga({
  schema,
  graphiql: true,
  cors: {
    origin: "*",
    credentials: false,
  },
});

const server = createServer(yoga);

server.listen(port, () => {
  console.log(`GraphQL API running at http://localhost:${port}/graphql`);
});
