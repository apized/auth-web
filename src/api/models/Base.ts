export type UUID = string;

export type Model = {
  id?: UUID;
  metadata?: { [key: string]: unknown };
};
