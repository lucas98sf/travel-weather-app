/**
 * @generated SignedSource<<c6ab80ef6cbac7333e2a545170f7485b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from "relay-runtime";
export type Activity =
  | "INDOOR_SIGHTSEEING"
  | "OUTDOOR_SIGHTSEEING"
  | "SKIING"
  | "SURFING"
  | "%future added value";
export type FactorImpact = "NEGATIVE" | "NEUTRAL" | "POSITIVE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type activityCard_recommendation$data = {
  readonly activity: Activity;
  readonly bestDay: string;
  readonly factors: ReadonlyArray<{
    readonly impact: FactorImpact;
    readonly key: string;
    readonly label: string;
    readonly unit: string | null | undefined;
    readonly value: number;
  }>;
  readonly note: string | null | undefined;
  readonly rank: number;
  readonly score: number;
  readonly summary: string;
  readonly " $fragmentType": "activityCard_recommendation";
};
export type activityCard_recommendation$key = {
  readonly " $data"?: activityCard_recommendation$data;
  readonly " $fragmentSpreads": FragmentRefs<"activityCard_recommendation">;
};

const node: ReaderFragment = {
  argumentDefinitions: [],
  kind: "Fragment",
  metadata: null,
  name: "activityCard_recommendation",
  selections: [
    {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "activity",
      storageKey: null,
    },
    {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "score",
      storageKey: null,
    },
    {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "rank",
      storageKey: null,
    },
    {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "bestDay",
      storageKey: null,
    },
    {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "summary",
      storageKey: null,
    },
    {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "note",
      storageKey: null,
    },
    {
      alias: null,
      args: null,
      concreteType: "ActivityFactor",
      kind: "LinkedField",
      name: "factors",
      plural: true,
      selections: [
        {
          alias: null,
          args: null,
          kind: "ScalarField",
          name: "key",
          storageKey: null,
        },
        {
          alias: null,
          args: null,
          kind: "ScalarField",
          name: "label",
          storageKey: null,
        },
        {
          alias: null,
          args: null,
          kind: "ScalarField",
          name: "impact",
          storageKey: null,
        },
        {
          alias: null,
          args: null,
          kind: "ScalarField",
          name: "value",
          storageKey: null,
        },
        {
          alias: null,
          args: null,
          kind: "ScalarField",
          name: "unit",
          storageKey: null,
        },
      ],
      storageKey: null,
    },
  ],
  type: "ActivityRecommendation",
  abstractKey: null,
};

(node as any).hash = "93e1c67d3241063fa32febdeb72c52ed";

export default node;
