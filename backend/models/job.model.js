import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  salary: { type: Number, required: true },
  experienceLevel: { type: Number, required: true },
  location: { type: String, required: true },
  jobType: { type: String, required: true },
  position: { type: Number, required: true },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
  }],
  jobPosted: {
    type: Boolean,
    default: false,
  },
  lastPost: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Automatically update `lastPost` & `jobPosted`
jobSchema.pre('save', function (next) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  this.jobPosted = this.lastPost && this.lastPost >= thirtyDaysAgo;
  this.lastPost = now;

  next();
});

export const Job = mongoose.model("Job", jobSchema);
