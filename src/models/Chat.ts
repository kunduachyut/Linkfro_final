import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage {
  sender: string;
  senderRole: 'consumer' | 'superadmin' | 'contentmanager';
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface IChat extends Document {
  purchaseId: string;
  messages: IMessage[];
  lastUpdated: Date;
  createdAt: Date;
}

const chatSchema = new Schema<IChat>({
  purchaseId: {
    type: String,
    required: true,
    ref: 'Purchase'
  },
  messages: [{
    sender: {
      type: String,
      required: true
    },
    senderRole: {
      type: String,
      enum: ['consumer', 'superadmin', 'contentmanager'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

chatSchema.index({ purchaseId: 1 });

const Chat: Model<IChat> = mongoose.models.Chat || mongoose.model<IChat>('Chat', chatSchema);

export default Chat;