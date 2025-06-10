import mongoose, { Document, Schema } from 'mongoose';

export interface ISecurityTip extends Document {
  content: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const SecurityTipSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.model<ISecurityTip>('SecurityTip', SecurityTipSchema); 