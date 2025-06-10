import mongoose, { Document, Schema } from 'mongoose';

export interface IComment {
  user: {
    id: mongoose.Types.ObjectId;
    username: string;
  };
  content: string;
  createdAt: Date;
}

export interface IArticle extends Document {
  title: string;
  content: string;
  author: {
    id: mongoose.Types.ObjectId;
    username: string;
  };
  category: string;
  tags: string[];
  readTime: number;
  imageUrl?: string;
  videoUrl?: string;
  likes: mongoose.Types.ObjectId[];
  views: number;
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [50, 'Content must be at least 50 characters long']
  },
  author: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['cybersecurity', 'privacy', 'ethical-hacking', 'network-security']
  },
  tags: [{
    type: String,
    trim: true
  }],
  readTime: {
    type: Number,
    required: true,
    min: [1, 'Read time must be at least 1 minute']
  },
  imageUrl: {
    type: String,
    trim: true
  },
  videoUrl: {
    type: String,
    trim: true
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  comments: [{
    user: {
      id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      username: {
        type: String,
        required: true
      }
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Add text index for search functionality
ArticleSchema.index({ title: 'text', content: 'text', tags: 'text' });

export const Article = mongoose.model<IArticle>('Article', ArticleSchema); 