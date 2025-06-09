export type Bin = {
  id: number;
  type: "bin";
  latitude: string;
  longitude: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  acceptedAt: Date | null;
  visibility: boolean;
};
