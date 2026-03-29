import {
  Environment,
  type GraphQLResponse,
  Network,
  RecordSource,
  Store,
  type FetchFunction,
  type RequestParameters,
  type Variables,
} from "relay-runtime";

const fetchGraphQL: FetchFunction = async (params: RequestParameters, variables: Variables) => {
  const response = await fetch(
    import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:4000/graphql",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        query: params.text,
        variables,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`GraphQL request failed with ${response.status}`);
  }

  return response.json() as Promise<GraphQLResponse>;
};

export const relayEnvironment = new Environment({
  network: Network.create(fetchGraphQL),
  store: new Store(new RecordSource()),
});
