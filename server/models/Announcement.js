const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    active: { type: Boolean, default: true },
    bgColor: { type: String, default: "#F97316" },
    textColor: { type: String, default: "#ffffff" },
    link: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", AnnouncementSchema);
