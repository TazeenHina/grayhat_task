const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    learnerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    workshopId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Workshop'
    },
    status:{
        type: String,
        enum:['enrolled','completed','pending'],
        default:'pending'
    }
})

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

exports.Enrollment = Enrollment;