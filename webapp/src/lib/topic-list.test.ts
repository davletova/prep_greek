import { describe, expect, it } from "vitest";
import { toTopicListItems } from "./topic-list.ts";

describe("toTopicListItems", () => {
  it("keeps only topic list fields", () => {
    expect(
      toTopicListItems([
        {
          id: "topic-1",
          title: "Topic 1",
          subtitle: "Subtitle 1",
          extra: "ignored",
        },
      ])
    ).toEqual([
      {
        id: "topic-1",
        title: "Topic 1",
        subtitle: "Subtitle 1",
      },
    ]);
  });
});
