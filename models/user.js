const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/notesApp");

const  userSchema = mongoose.Schema({
    fname: String,
    lname: String,
    email: String,
    password: String,
    notes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "note"
        }
    ],
    profilepic: {
        type: String,
        default: "default.jpg"
    }
});

module.exports = mongoose.model("user", userSchema);