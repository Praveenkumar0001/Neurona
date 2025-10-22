import mongoose from 'mongoose';

const symptomReportSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    responses: {
      name: String,
      mood: {
        type: String,
        enum: ['happy', 'neutral', 'sad', 'anxious', 'depressed', 'hopeless']
      },
      energy: {
        type: Number,
        min: 1,
        max: 5
      },
      sleep: {
        type: String,
        enum: ['good', 'fair', 'poor', 'insomnia']
      },
      anxiety: {
        type: Number,
        min: 1,
        max: 5
      },
      appetite: {
        type: String,
        enum: ['normal', 'increased', 'decreased', 'no appetite']
      },
      concentration: {
        type: String,
        enum: ['not at all', 'sometimes', 'often', 'always']
      },
      socialWithdrawal: {
        type: String,
        enum: ['no', 'sometimes', 'often', 'yes']
      },
      physicalSymptoms: [
        {
          type: String,
          enum: [
            'headaches',
            'fatigue',
            'chest pain',
            'stomach issues',
            'muscle tension',
            'none'
          ]
        }
      ],
      duration: {
        type: String,
        enum: [
          'less than 2 weeks',
          '2-4 weeks',
          '1-3 months',
          '3-6 months',
          'more than 6 months'
        ]
      },
      previousTreatment: {
        type: Boolean,
        default: false
      },
      additionalNotes: String
    },
    analysis: {
      overallScore: {
        type: Number,
        required: true,
        min: 0,
        max: 30
      },
      recommendation: {
        type: String,
        enum: ['psychiatrist', 'therapist', 'counselor'],
        required: true
      },
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe'],
        required: true
      },
      summary: {
        type: String,
        required: true
      },
      suggestedActions: [String]
    },
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
      }
    ],
    pdfPath: String,
    pdfFileName: String,
    status: {
      type: String,
      enum: ['completed', 'reviewed', 'archived'],
      default: 'completed'
    }
  },
  { timestamps: true }
);

// Indexes
symptomReportSchema.index({ patientId: 1, createdAt: -1 });
symptomReportSchema.index({ 'analysis.severity': 1 });
symptomReportSchema.index({ status: 1 });

// Virtual for formatted date
symptomReportSchema.virtual('formattedDate').get(function () {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

const SymptomReport = mongoose.model('SymptomReport', symptomReportSchema);
export default SymptomReport;
