export const objectEntries: <Obj>(o: Obj) => [keyof Obj, Obj[keyof Obj]][] =
  Object.entries;

export const objectKeys: <Obj>(o: Obj) => (keyof Obj)[] = Object.keys;

export const objectValues = Object.values;
