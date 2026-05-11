export function reorderInList<T extends { entryKey: string }>(
  list: T[],
  activeId: string,
  overId: string,
) {
  const from = list.findIndex((item) => item.entryKey === activeId);
  const to = list.findIndex((item) => item.entryKey === overId);

  if (from < 0 || to < 0 || from === to) {
    return list;
  }

  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function reorderByIndex<T>(list: T[], from: number, to: number) {
  if (
    from < 0 ||
    to < 0 ||
    from >= list.length ||
    to >= list.length ||
    from === to
  ) {
    return list;
  }

  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
