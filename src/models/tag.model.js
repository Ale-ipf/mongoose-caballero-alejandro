import { model, Schema } from "mongoose";

const tagSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tagSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "tags",
});

export const Tag = model("Tag", tagSchema);