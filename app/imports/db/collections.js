import { Mongo } from "meteor/mongo";

export const MainObjects = new Mongo.Collection("mainObjects");
export const FieldContainers = new Mongo.Collection("fieldContainers");
export const FieldObjects = new Mongo.Collection("fieldObjects");
export const Files = new Mongo.Collection("files");
export const Highlights = new Mongo.Collection("highlights");
