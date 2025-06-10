import mongoose, { Document, Schema } from 'mongoose';

export interface IBookmark extends Document {
  user: mongoose.Types.ObjectId;
  article: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  article: {
    type: Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  }
}, {
  timestamps: true
});

// Create a compound index to ensure unique user-article pairs
BookmarkSchema.index({ user: 1, article: 1 }, { unique: true });

export const Bookmark = mongoose.model<IBookmark>('Bookmark', BookmarkSchema); 