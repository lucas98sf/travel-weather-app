import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { lexicographicSortSchema, printSchema } from "graphql";
import { schema } from "./schema.ts";

const schemaFilePath = fileURLToPath(new URL("../schema.graphql", import.meta.url));
const stableSchema = lexicographicSortSchema(schema);

writeFileSync(schemaFilePath, `${printSchema(stableSchema).trim()}\n`, "utf8");
