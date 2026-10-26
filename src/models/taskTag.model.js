import { model, Schema } from "mongoose";

const taskTagSchema = new Schema(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    tag: {
      type: Schema.Types.ObjectId,
      ref: "Tag",
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

taskTagSchema.index(
  { task: 1, tag: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null },
  },
);

export const TaskTag = model("TaskTag", taskTagSchema);