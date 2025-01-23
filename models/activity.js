const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true, 
        minlength: 5,
        maxlength: 50
      },
    description: { 
        type: String,  
        required: true,
        minlength:10,
        maxlength:255
      },
    schedule: Date,
    workshopId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Workshop',

    }
});

// const Activity = mongoose.model('Activity', activitySchema );

// exports.Activity = Activity; 

module.exports = mongoose.model('Activity', activitySchema);
