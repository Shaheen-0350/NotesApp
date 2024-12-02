const mongoose = require("mongoose");

let noteSchema = mongoose.Schema({
    note: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
});

module.exports = mongoose.model("note", noteSchema);