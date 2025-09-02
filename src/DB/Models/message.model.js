import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    content: {
      type: String,
      minLength: 2,
      maxLength: 20000,
      required: function () {
        return this.attachments?.length ? false : true;
      },
    },
    attachments: [
      {
        secure_url: String,
        public_id: String,
      },
    ],
    recieverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const MessageModel =
  mongoose.models.Message || mongoose.model("Message", messageSchema);
