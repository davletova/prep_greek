import type { TopicListItem } from "../components/topic-list-screen.tsx";

export function toTopicListItems<T extends TopicListItem>(
  topics: readonly T[]
): TopicListItem[] {
  return topics.map(({ id, title, subtitle }) => ({
    id,
    title,
    subtitle
  }));
}
