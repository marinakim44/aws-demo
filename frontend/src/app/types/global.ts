export type Feature = {
  id: string;
  name: string;
};
export type Bucket = {
  id: string;
  name: string;
  features: Feature[];
};
