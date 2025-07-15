const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');


const userSchema = new mongoose.Schema({

  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'],
    index: true
  },

  avatar: {
    type: String,
    default: 'default-avatar.jpg'
  },

  encryptedData: {
    email: {
      type: {
        salt: String,
        iv: String,
        content: String,
        authTag: String,
        algorithm: String
      },
      required: [true, 'Email is required'],
      unique: true
    },
    firstName: {
      type: {
        salt: String,
        iv: String,
        content: String,
        authTag: String,
        algorithm: String
      },
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: {
        salt: String,
        iv: String,
        content: String,
        authTag: String,
        algorithm: String
      },
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    phone: {
      type: {
        salt: String,
        iv: String,
        content: String,
        authTag: String,
        algorithm: String
      },
      validate: {
        validator: function(v) {
          if (!this.decryptedPhone) return true;
          return /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(this.decryptedPhone);
        },
        message: 'Please provide a valid phone number'
      }
    },
    dateOfBirth: {
      type: {
        salt: String,
        iv: String,
        content: String,
        authTag: String,
        algorithm: String
      },
      validate: {
        validator: function(v) {
          if (!this.decryptedDOB) return true;
          return new Date(this.decryptedDOB) < new Date();
        },
        message: 'Date of birth must be in the past'
      }
    }
  },

  emailHash: {
    type: String,
    required: true,
    unique: true,
    select: false,
    index: true,
  },

  phoneHash: {
    type: String,
    select: false,
    index: true,
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [12, 'Password must be at least 12 characters'],
  },

  auth: {
  // Password-related fields
  passwordChangedAt: {
    type: Date,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  
  // Email verification
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },

  // Two-factor authentication (simplified version)
  twoFactor: {
    type: {
      secret: {
      type: {
        salt: String,
        iv: String,
        content: String,
        authTag: String,
        algorithm: String
      },        
      select: false
      },
      enabled: {
        type: Boolean,
        default: false,
        select: false
      }
    },
    default: () => ({})
  },

  // Login history
  loginHistory: {
    type: [{
      ip: {
        type: String,
        required: true
      },
      userAgent: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    default: []
  },
  
  // Social auth integrations
  github: {
    type: {
      id: {
        type: String,
        default: null
      },
      profile: {
        type: Object,
        default: () => ({})
      }
    },
    default: () => ({})
  },
  
  facebook: {
    type: {
      id: {
        type: String,
        default: null
      },
      profile: {
        type: Object,
        default: () => ({})
      }
    },
    default: () => ({})
  },
  
  // MFA Configuration
  mfa: {
    type: {
      enabled: {
        type: Boolean,
        default: false,
        select: false
      },
      enabledAt: {
        type: Date,
        select: false
      },
      secret: {
        type: {
          salt: {
            type: String,
            required: true
          },
          iv: {
            type: String,
            required: true
          },
          content: {
            type: String,
            required: true
          },
          authTag: {
            type: String,
            required: true
          },
          algorithm: {
            type: String,
            required: true
          }
        },
        select: false
      },
      methods: {
        type: [String],
        enum: ['totp', 'sms', 'email', 'authenticator', 'backup'],
        default: [],
        select: false
      },
      backupCodes: {
        type: [{
          code: {
            type: String,
            required: true,
            select: false
          },
          used: {
            type: Boolean,
            default: false,
            select: false
          },
          usedAt: {
            type: Date,
            select: false
          }
        }],
        select: false
      },
      devices: {
        type: [{
          id: {
            type: String,
            required: true,
            select: false
          },
          name: {
            type: String,
            required: true,
            select: false
          },
          ip: {
            type: String,
            select: false
          },
          userAgent: {
            type: String,
            select: false
          },
          lastUsed: {
            type: Date,
            select: false
          },
          trusted: {
            type: Boolean,
            default: false,
            select: false
          },
          createdAt: {
            type: Date,
            default: Date.now,
            select: false
          }
        }],
        select: false
      },
      recoveryOptions: {
        type: {
          email: {
            type: Boolean,
            default: true,
            select: false
          },
          sms: {
            type: Boolean,
            default: false,
            select: false
          },
          backupCodes: {
            type: Boolean,
            default: true,
            select: false
          }
        },
        default: () => ({}),
        select: false
      },
      failedAttempts: {
        type: Number,
        default: 0,
        select: false
      },
      lockUntil: {
        type: Date,
        select: false
      }
    },
    default: () => ({})
  }
  },

  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'deleted'],
    default: 'pending'
  },

  roles: {
    type: [String],
    enum: ['customer', 'seller', 'moderator', 'admin'],
    default: ['customer']
  },

  social: {
    googleId: String,
    facebookId: String,
    twitterId: String,
    githubId: String
  },

  preferences: {
    language: {
      type: String,
      enum: ['en', 'es', 'fr', 'de', 'tr'],
      default: 'en'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: false
      },
      sms: {
        type: Boolean,
        default: false
      }
    }
  },

  commerce: {
    wishlist: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product' 
    }],
    cart: {
      type: [{
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        product: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'Product', 
          required: true 
        },
        quantity: { 
          type: Number, 
          default: 1, 
          min: 1 
        },
        size: String,
        color: String,
        addedAt: { 
          type: Date, 
          default: Date.now 
        }
      }],
      default: [] // Ensure cart defaults to empty array
    }
  },

  meta: {
    loginCount: {
      type: Number,
      default: 0
    },
    lastLogin: Date,
    lastIp: String
  },

}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      // Remove sensitive data from output
      delete ret.password;
      delete ret.auth;
      delete ret.encryptedData;
      delete ret.social;
      delete ret.meta;
      return ret;
    }
  }
});

// Virtual fields for validation (not stored in DB)
userSchema.virtual('decryptedEmail');
userSchema.virtual('decryptedPhone');
userSchema.virtual('decryptedDOB');

// Virtuals
userSchema.virtual('fullName').get(function() {
  return `${this.encryptedData.firstName} ${this.encryptedData.lastName}`;
});

// Indexes
userSchema.index({ username: 'text' });
userSchema.index({ status: 1 });
userSchema.index({ 'commerce.orders': 1 });
userSchema.index({ mfaEnabled: 1 });
userSchema.index({ 'mfaDevices.id': 1 });
userSchema.index({ mfaLockUntil: 1 }, { expireAfterSeconds: 0 });


module.exports = userSchema;