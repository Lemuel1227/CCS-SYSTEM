const Announcement = require("../models/Announcement");

// @desc    Get all announcements (public or user dashboard)
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = async (req, res) => {
  try {
    let query = {};
    
    // If not admin/faculty OR specifically asking for published only
    if (req.query.status) {
      query.status = req.query.status;
    } else if (req.user.role.toLowerCase() === 'student') {
      // Students only see posted announcements
      query.status = 'Posted';
    }

    const announcements = await Announcement.find(query)
      .populate("author", "firstName lastName name role")
      .sort({ postedAt: -1, createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    console.error("GET Announcements Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create an announcement
// @route   POST /api/announcements
// @access  Private (Admin, Faculty)
const createAnnouncement = async (req, res) => {
  const userRole = req.user.role.toLowerCase();
  if (userRole !== "admin" && userRole !== "faculty") {
    return res.status(403).json({ message: "Not authorized to create announcements" });
  }

  const { title, content, status } = req.body;
  let image = null;

  if (req.file) {
    // Generate URL path explicitly matching static route
    image = `/uploads/announcements/${req.file.filename}`;
  }

  try {
    const announcement = new Announcement({
      title,
      content,
      image,
      status: status || "Draft",
      author: req.user._id,
      postedAt: status === "Posted" ? Date.now() : null,
    });

    const createdAnnouncement = await announcement.save();
    
    // Populate author before returning
    await createdAnnouncement.populate("author", "firstName lastName name role");
    
    res.status(201).json(createdAnnouncement);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update an announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin, Faculty)
const updateAnnouncement = async (req, res) => {
  const userRole = req.user.role.toLowerCase();
  if (userRole !== "admin" && userRole !== "faculty") {
    return res.status(403).json({ message: "Not authorized to update announcements" });
  }

  const { title, content, status } = req.body;

  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Optional: only let the author or Admin edit
    if (announcement.author.toString() !== req.user._id.toString() && userRole !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this announcement" });
    }

    announcement.title = title || announcement.title;
    announcement.content = content || announcement.content;
    
    if (req.file) {
      announcement.image = `/uploads/announcements/${req.file.filename}`;
    }

    if (status && status !== announcement.status) {
      announcement.status = status;
      if (status === "Posted" && !announcement.postedAt) {
        announcement.postedAt = Date.now();
      }
    }

    const updatedAnnouncement = await announcement.save();
    await updatedAnnouncement.populate("author", "firstName lastName name role");

    res.json(updatedAnnouncement);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin, Faculty)
const deleteAnnouncement = async (req, res) => {
  const userRole = req.user.role.toLowerCase();
  if (userRole !== "admin" && userRole !== "faculty") {
    return res.status(403).json({ message: "Not authorized to delete announcements" });
  }

  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    if (announcement.author.toString() !== req.user._id.toString() && userRole !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this announcement" });
    }

    await announcement.deleteOne();
    res.json({ message: "Announcement removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};