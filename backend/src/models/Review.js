import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    review: {
      type: String,
      maxlength: [500, 'Review cannot exceed 500 characters']
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    helpful: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Indexes
reviewSchema.index({ doctorId: 1, createdAt: -1 });
reviewSchema.index({ patientId: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ bookingId: 1 }, { unique: true });

// Update doctor's rating after review is saved
reviewSchema.post('save', async function () {
  try {
    const Doctor = mongoose.model('Doctor');
    const Review = mongoose.model('Review');

    const reviews = await Review.find({ doctorId: this.doctorId });
    const totalRatings = reviews.length;
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

    await Doctor.findByIdAndUpdate(this.doctorId, {
      rating: parseFloat(avgRating.toFixed(1)),
      totalRatings
    });
  } catch (error) {
    console.error('Error updating doctor rating:', error);
  }
});

// Update doctor's rating after review is deleted
reviewSchema.post('remove', async function () {
  try {
    const Doctor = mongoose.model('Doctor');
    const Review = mongoose.model('Review');

    const reviews = await Review.find({ doctorId: this.doctorId });
    const totalRatings = reviews.length;

    if (totalRatings === 0) {
      await Doctor.findByIdAndUpdate(this.doctorId, {
        rating: 0,
        totalRatings: 0
      });
    } else {
      const avgRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings;
      await Doctor.findByIdAndUpdate(this.doctorId, {
        rating: parseFloat(avgRating.toFixed(1)),
        totalRatings
      });
    }
  } catch (error) {
    console.error('Error updating doctor rating:', error);
  }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
