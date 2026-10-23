import { model, Schema } from "mongoose";

const roleSchema = new Schema(
  {
    rolename: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Role = model("Role", roleSchema);