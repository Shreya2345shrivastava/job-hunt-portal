import mongoose from "mongoose";

const uniSchema = new mongoose.Schema({
  loginHistory: [{
    type: Date,
    default: Date.now
  }],
  studentLogin: {
    type: Number,
    default: 0,
  },
  recruiterLogin: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

// Method to track login by role
uniSchema.methods.trackLogin = function (role) {
  const now = new Date();

  // Add current login
  this.loginHistory.push(now);

  // Filter only last 30 days
  this.loginHistory = this.loginHistory.filter(
    login => (now - login) <= 30 * 24 * 60 * 60 * 1000
  );

  // Increment based on role
  if (role === 'student') {
    this.studentLogin += 1;
  } else if (role === 'recruiter') {
    this.recruiterLogin += 1;
  }
};

// Clean old history before save
uniSchema.pre('save', function (next) {
  const now = new Date();
  this.loginHistory = this.loginHistory.filter(
    login => (now - login) <= 30 * 24 * 60 * 60 * 1000
  );
  next();
});

export const Uni = mongoose.model('Uni', uniSchema);
