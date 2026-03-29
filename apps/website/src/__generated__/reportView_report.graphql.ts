/**
 * @generated SignedSource<<ba0132ee8c112ece8587b0cfbf5c857c>>
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
export type reportView_report$data = {
  readonly activities: ReadonlyArray<{
    readonly activity: Activity;
    readonly " $fragmentSpreads": FragmentRefs<"activityCard_recommendation">;
  }>;
  readonly dailySummaries: ReadonlyArray<{
    readonly activity: Activity;
    readonly date: string;
    readonly factors: ReadonlyArray<{
      readonly impact: FactorImpact;
      readonly key: string;
      readonly label: string;
      readonly unit: string | null | undefined;
      readonly value: number;
    }>;
    readonly label: string;
    readonly score: number;
  }>;
  readonly generatedAt: string;
  readonly location: {
    readonly country: string;
    readonly name: string;
    readonly region: string | null | undefined;
    readonly timezone: string;
  };
  readonly " $fragmentType": "reportView_report";
};
export type reportView_report$key = {
  readonly " $data"?: reportView_report$data;
  readonly " $fragmentSpreads": FragmentRefs<"reportView_report">;
};

const node: ReaderFragment = (function () {
  var v0 = {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "activity",
      storageKey: null,
    },
    v1 = {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "label",
      storageKey: null,
    };
  return {
    argumentDefinitions: [],
    kind: "Fragment",
    metadata: null,
    name: "reportView_report",
    selections: [
      {
        alias: null,
        args: null,
        kind: "ScalarField",
        name: "generatedAt",
        storageKey: null,
      },
      {
        alias: null,
        args: null,
        concreteType: "LocationOption",
        kind: "LinkedField",
        name: "location",
        plural: false,
        selections: [
          {
            alias: null,
            args: null,
            kind: "ScalarField",
            name: "name",
            storageKey: null,
          },
          {
            alias: null,
            args: null,
            kind: "ScalarField",
            name: "region",
            storageKey: null,
          },
          {
            alias: null,
            args: null,
            kind: "ScalarField",
            name: "country",
            storageKey: null,
          },
          {
            alias: null,
            args: null,
            kind: "ScalarField",
            name: "timezone",
            storageKey: null,
          },
        ],
        storageKey: null,
      },
      {
        alias: null,
        args: null,
        concreteType: "ActivityRecommendation",
        kind: "LinkedField",
        name: "activities",
        plural: true,
        selections: [
          v0 /*: any*/,
          {
            args: null,
            kind: "FragmentSpread",
            name: "activityCard_recommendation",
          },
        ],
        storageKey: null,
      },
      {
        alias: null,
        args: null,
        concreteType: "DailyActivitySummary",
        kind: "LinkedField",
        name: "dailySummaries",
        plural: true,
        selections: [
          v0 /*: any*/,
          {
            alias: null,
            args: null,
            kind: "ScalarField",
            name: "date",
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
              v1 /*: any*/,
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
          v1 /*: any*/,
          {
            alias: null,
            args: null,
            kind: "ScalarField",
            name: "score",
            storageKey: null,
          },
        ],
        storageKey: null,
      },
    ],
    type: "TravelActivityReport",
    abstractKey: null,
  };
})();

(node as any).hash = "cf2e9190659c0953873bfbae762b9cd6";

export default node;
