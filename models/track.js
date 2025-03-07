const mongoose = require('mongoose');
const { isURL } = require('validator'); // Add this line

const trackSchema = new mongoose.Schema({
    artist: String,
    title: String,
    year: Number,
    genre: String,
    style: [String],
    image: { 
        type: String, 
        default: null,
        validate: {
            validator: function(v) {
                return v === null || isURL(v, { protocols: ['http','https','blob'], require_protocol: true });
            },
            message: props => `${props.value} is not a valid URI!`
        }
    },
    video: { 
        type: String, 
        default: null,
        validate: {
            validator: function(v) {
                return v === null || isURL(v, { protocols: ['http','https','blob'], require_protocol: true });
            },
            message: props => `${props.value} is not a valid URI!`
        }
    },
    dateAdded: { type: Date, default: Date.now }
});

const Track = mongoose.model('Track', trackSchema);

module.exports = Track;
