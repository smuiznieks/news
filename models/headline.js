var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HeadlineSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Link the ObjectId to the Note model
    note: [{
        type: Schema.Types.ObjectId,
        ref: 'Note'
    }]
});

var Headline = mongoose.model('Headline', HeadlineSchema);
module.exports = Headline;