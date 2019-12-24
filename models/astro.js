var mongoose = require("mongoose");
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;

var astroSchema = new Schema({
    title: String,
    image: String,
    imageId: String,
    description: String,
    author: {
        id: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    created: {
        type: Date, default: Date.now
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

astroSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Astro", astroSchema);