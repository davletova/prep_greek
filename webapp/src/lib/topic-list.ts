import type { TopicListItem } from "../types/topic-list.ts";

export function toTopicListItems<T extends TopicListItem>(topics: readonly T[]): TopicListItem[] {
  return topics.map(({ id, title, subtitle, disabled }) => ({
    id,
    title,
    subtitle,
    ...(disabled === undefined ? {} : { disabled }),
  }));
}
