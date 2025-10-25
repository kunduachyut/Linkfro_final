import mongoose from 'mongoose';

// Define the Website interface
export interface IWebsite extends mongoose.Document {
  title: string;
  url: string;
  description: string;
  category: string[];
  price: number;
  priceCents: number;
  // (originalPriceCents/adminExtraPriceCents were removed — priceCents is authoritative)
  image: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected' | 'priceConflict';
  available: boolean; // Add availability field
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  views: number;
  clicks: number;
  featured: boolean;
  tags: string[];
  primaryCountry?: string; // Add primaryCountry field
  orderAcceptedEmail?: string; // Add optional order accepted email
  primeTrafficCountries?: string[]; // Add prime traffic countries field
  metaTitle?: string;
  metaDescription?: string;

  // SEO Metrics
  DA?: number;
  PA?: number;
  Spam?: number;
  OrganicTraffic?: number;
  DR?: number;
  RD?: string;
  // Publisher price workflow
  publisherUpdatedPriceCents?: number | null; // price proposed by publisher, pending admin approval
  publisherPreviousPriceCents?: number | null; // previous publisher-visible price for auditing

  // Price conflict fields
  conflictsWith?: mongoose.Types.ObjectId; // ID of the website this conflicts with
  conflictGroup?: string; // Group ID for multiple conflicting websites
  isOriginal?: boolean;   // True for the original website, false for the new submission

  // Timestamps (createdAt and updatedAt) are provided by mongoose when timestamps: true
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  isNew: boolean;

  // Methods
  approve(reason?: string): Promise<IWebsite>;
  reject(reason: string): Promise<IWebsite>;
  isPending(): boolean;
  isApproved(): boolean;
  isRejected(): boolean;
  isPriceConflict(): boolean;
  createPriceConflict(originalWebsite: IWebsite): Promise<void>;
}

// Define the static methods interface
interface WebsiteModel extends mongoose.Model<IWebsite> {
  findByStatus(status: string): mongoose.Query<IWebsite[], IWebsite>;
  findPending(): mongoose.Query<IWebsite[], IWebsite>;
  findApproved(): mongoose.Query<IWebsite[], IWebsite>;
  findRejected(): mongoose.Query<IWebsite[], IWebsite>;
  findPriceConflicts(): mongoose.Query<IWebsite[], IWebsite>;
  findByUser(userId: string, status?: string): mongoose.Query<IWebsite[], IWebsite>;
}

const WebsiteSchema = new mongoose.Schema({
  trafficValue: { type: Number, default: 0 },
  locationTraffic: { type: Number, default: 0 },
  greyNicheAccepted: { type: Boolean, default: false },
  specialNotes: { type: String, default: "" },
  
  // Existing fields
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  url: {
    type: String,
    required: [true, 'URL is required'],
    validate: {
      validator: function(v: string) {
        if (!v) return false;
        const urlToTest = v.match(/^https?:\/\//) ? v : `https://${v}`;
        try {
          new URL(urlToTest);
          return true;
        } catch (e) {
          return false;
        }
      },
      message: 'Please enter a valid URL'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: [String], // Changed from String with enum to [String] array
    required: [true, 'Category is required'],
    validate: {
      validator: function(v: string[]) {
        return v && v.length > 0;
      },
      message: 'At least one category is required'
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  priceCents: {
    type: Number,
    required: [true, 'Price in cents is required'],
    min: [0, 'Price cannot be negative']
  },
  // Preserve the original publisher-visible price when admins add an extra amount
  originalPriceCents: {
    type: Number,
    default: null
  },
  // Publisher-proposed updated price (pending admin approval)
  publisherUpdatedPriceCents: {
    type: Number,
    default: null
  },
  // Store the previous publisher-visible price when a publisher proposes an update
  publisherPreviousPriceCents: {
    type: Number,
    default: null
  },
  // Admin-applied extra (in cents) stored separately so publisher views can show the original price
  adminExtraPriceCents: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: '/default-website-image.png'
  },
  userId: {
    type: String,
    required: true
  },

  // Add availability field with default to true
  available: {
    type: Boolean,
    default: true
  },

  // Approval workflow
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'priceConflict'],
    default: 'pending'
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
    default: ''
  },

  // Price conflict fields
  conflictsWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    default: null
  },
  conflictGroup: {
    type: String,
    default: null
  },
  isOriginal: {
    type: Boolean,
    default: true
  },

  // Analytics
  views: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  tags: [{ type: String, trim: true }],
  primaryCountry: {
    type: String,
    trim: true,
    maxlength: [100, 'Country name cannot exceed 100 characters']
  },
  primeTrafficCountries: [{
    type: String,
    trim: true,
    maxlength: [100, 'Country name cannot exceed 100 characters']
  }],

  // Optional email used for order acceptance; can be reused across multiple websites
  orderAcceptedEmail: {
    type: String,
    trim: true,
    default: null,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // allow empty
        return /^\S+@\S+\.\S+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },

  // SEO fields
  metaTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'Meta title cannot exceed 60 characters']
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },

  // SEO Metrics
  DA: { type: Number },
  PA: { type: Number },
  Spam: { type: Number },
  OrganicTraffic: { type: Number },
  DR: { type: Number },
  RD: { type: String }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  autoIndex: false // Prevent automatic index creation
});

// Note: Indexes disabled to prevent unique constraints
// Indexes can be created manually in production if needed for performance
// WebsiteSchema.index({ userId: 1, status: 1 });
// WebsiteSchema.index({ status: 1, createdAt: -1 });
// WebsiteSchema.index({ category: 1, status: 1 });
// WebsiteSchema.index({ url: 1, status: 1 }); // Non-unique index for URL queries

// Virtual: isNew (less than 7 days old)
WebsiteSchema.virtual('isNew').get(function(this: IWebsite) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return this.createdAt > sevenDaysAgo;
});

// Pre-save hook to ensure status is set to pending when website is updated
WebsiteSchema.pre('save', function(this: IWebsite, next) {
  // If this is an update operation (not a new document) and any field other than status is modified
  if (!this.isNew && this.isModified()) {
    // Check if any field other than status, approvedAt, rejectedAt, or rejectionReason is modified
    const modifiedPaths = this.modifiedPaths();
    const contentFieldsModified = modifiedPaths.some(path => 
      !['status', 'approvedAt', 'rejectedAt', 'rejectionReason', '_id', 'updatedAt', 'createdAt', 'conflictGroup', 'conflictsWith', 'isOriginal'].includes(path)
    );
    
    // If content fields are modified and status was explicitly changed by API, don't override it
    // This allows the API logic to handle status changes appropriately
    if (contentFieldsModified && !this.isModified('status')) {
      console.log('🗓️ Pre-save hook: Content fields modified but status not explicitly set');
      // Let the API handle the status logic
    }
  }
  next();
});

// Methods
WebsiteSchema.methods.approve = function(this: IWebsite, reason?: string) {
  this.status = 'approved';
  this.available = true; // Explicitly set available to true when approving
  this.approvedAt = new Date();
  this.rejectionReason = '';
  return this.save();
};

WebsiteSchema.methods.reject = function(this: IWebsite, reason: string = '') {
  this.status = 'rejected';
  this.rejectedAt = new Date();
  this.rejectionReason = reason;
  return this.save();
};

WebsiteSchema.methods.isPriceConflict = function(this: IWebsite) {
  return this.status === 'priceConflict';
};

WebsiteSchema.methods.createPriceConflict = async function(this: IWebsite, originalWebsite: IWebsite) {
  const conflictGroup = `conflict_${originalWebsite._id}_${Date.now()}`;
  console.log('🔥 Creating price conflict:', {
    conflictGroup,
    originalId: originalWebsite._id,
    originalStatus: originalWebsite.status,
    newId: this._id,
    newStatus: this.status
  });
  
  // Update original website to priceConflict status
  originalWebsite.status = 'priceConflict';
  originalWebsite.conflictGroup = conflictGroup;
  originalWebsite.isOriginal = true;
  await originalWebsite.save();
  console.log('✅ Updated original website to priceConflict status');
  
  // Update this website (new submission) to priceConflict status
  this.status = 'priceConflict';
  this.conflictsWith = originalWebsite._id as any; // Type assertion to avoid TypeScript error
  this.conflictGroup = conflictGroup;
  this.isOriginal = false;
  await this.save();
  console.log('✅ Updated new website to priceConflict status');
};

WebsiteSchema.methods.isPending = function(this: IWebsite) {
  return this.status === 'pending';
};
WebsiteSchema.methods.isApproved = function(this: IWebsite) {
  return this.status === 'approved';
};
WebsiteSchema.methods.isRejected = function(this: IWebsite) {
  return this.status === 'rejected';
};

// Statics
WebsiteSchema.statics.findPriceConflicts = function() {
  return this.find({ status: 'priceConflict' }).sort({ createdAt: -1 });
};

WebsiteSchema.statics.findByStatus = function(status: string) {
  return this.find({ status }).sort({ createdAt: -1 });
};
WebsiteSchema.statics.findPending = function() {
  return this.find({ status: 'pending' }).sort({ createdAt: -1 });
};
WebsiteSchema.statics.findApproved = function() {
  return this.find({ status: 'approved' }).sort({ createdAt: -1 });
};
WebsiteSchema.statics.findRejected = function() {
  return this.find({ status: 'rejected' }).sort({ createdAt: -1 });
};
WebsiteSchema.statics.findByUser = function(userId: string, status?: string) {
  const query: any = { userId };
  if (status) query.status = status;
  return this.find(query).sort({ createdAt: -1 });
};

// Transform output
WebsiteSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    // @ts-ignore - TypeScript doesn't recognize _id properly in this context
    ret.id = ret._id?.toString();
    // @ts-ignore - TypeScript doesn't recognize _id properly in this context
    delete ret._id;
  }
});

// Clear any cached model to ensure fresh compilation
if (mongoose.models.Website) {
  delete mongoose.models.Website;
}

// Final model with strict index control
const Website = mongoose.model<IWebsite, WebsiteModel>('Website', WebsiteSchema);

// Ensure no automatic indexing happens
mongoose.set('autoIndex', false);

export default Website;
