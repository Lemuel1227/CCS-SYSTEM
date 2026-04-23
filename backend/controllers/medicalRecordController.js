const MedicalRecord = require("../models/MedicalRecord");
const StudentProfile = require("../models/StudentProfile");
const Event = require("../models/Event");
const fs = require("fs");
const path = require("path");

const ALLOWED_STATUSES = ["Cleared", "Pending Review", "Needs Update"];
const ALLOWED_SCOPES = ["Standalone", "Event Requirement"];

const normalizeText = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return "";
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean).join(", ");
  }
  return String(value).trim();
};

const normalizeStatus = (value) => {
  if (!value) return undefined;
  const status = String(value).trim();
  return ALLOWED_STATUSES.includes(status) ? status : undefined;
};

const normalizeScope = (value) => {
  if (!value) return undefined;
  const scope = String(value).trim();
  return ALLOWED_SCOPES.includes(scope) ? scope : undefined;
};

const normalizeObjectId = async (value, Model) => {
  if (!value) return null;
  const exists = await Model.findById(value);
  return exists ? value : null;
};

const normalizeDocument = (document) => {
  if (!document || typeof document !== "object") return null;

  const fileName = normalizeText(document.fileName);
  if (!fileName) return null;

  return {
    fileName,
    storedFileName: normalizeText(document.storedFileName) || "",
    filePath: normalizeText(document.filePath) || "",
    mimeType: normalizeText(document.mimeType) || "",
    uploadDate: normalizeText(document.uploadDate) || new Date().toISOString().split("T")[0],
    fileSize: normalizeText(document.fileSize) || "",
  };
};

const normalizeDocuments = (documents) => {
  if (!Array.isArray(documents)) return [];
  return documents.map(normalizeDocument).filter(Boolean);
};

const buildHistoryEntry = ({ checkupDate, conditions, bloodType, status, documentAttached }) => ({
  checkupDate: normalizeText(checkupDate) || "",
  conditions: normalizeText(conditions) || "",
  bloodType: normalizeText(bloodType) || "",
  dateCompleted: new Date().toISOString().split("T")[0],
  status: normalizeStatus(status) || "Pending Review",
  documentAttached: normalizeText(documentAttached) || "None",
});

const toPublicFilePath = (absolutePath) => {
  if (!absolutePath) return "";
  const backendRoot = path.join(__dirname, "..");
  const relative = path.relative(backendRoot, absolutePath);
  return relative.split(path.sep).join("/");
};

const resolveStoredPath = (filePathValue) => {
  if (!filePathValue) return null;
  const backendRoot = path.join(__dirname, "..");
  const normalized = String(filePathValue).replaceAll("\\", "/");
  return path.join(backendRoot, normalized);
};

const safeUnlink = (filePathValue) => {
  const resolved = resolveStoredPath(filePathValue);
  if (!resolved) return;
  if (fs.existsSync(resolved)) {
    fs.unlinkSync(resolved);
  }
};

const buildProfileIdentity = async (user) => {
  const studentProfile = await StudentProfile.findOne({ user: user._id });
  const studentId = studentProfile?.studentNumber || user.userId || String(user._id);
  const nameParts = [studentProfile?.firstName, studentProfile?.middleName, studentProfile?.lastName]
    .map((part) => normalizeText(part))
    .filter(Boolean);
  const name = nameParts.length > 0 ? nameParts.join(" ") : normalizeText(user.name) || "Student";

  return { studentProfile, studentId, name };
};

const formatRecord = (record) => record;

const populateRecord = (query) => query.populate("event", "title date time location status");

const getMedicalRecords = async (req, res) => {
  try {
    const records = await populateRecord(MedicalRecord.find().sort({ updatedAt: -1 }));
    res.json(records.map(formatRecord));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMedicalRecordById = async (req, res) => {
  try {
    const record = await populateRecord(MedicalRecord.findById(req.params.id));
    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    res.json(formatRecord(record));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createMedicalRecord = async (req, res) => {
  try {
    const studentId = normalizeText(req.body.studentId);
    const name = normalizeText(req.body.name);
    if (!studentId || !name) {
      return res.status(400).json({ message: "Student ID and name are required" });
    }

    const existingRecord = await MedicalRecord.findOne({ studentId });
    if (existingRecord) {
      return res.status(400).json({ message: "Medical record already exists for this student" });
    }

    const documents = normalizeDocuments(req.body.documents);
    const history = Array.isArray(req.body.history) ? req.body.history : [];
    const eventId = req.body.event ? await normalizeObjectId(req.body.event, Event) : null;
    const scope = normalizeScope(req.body.scope) || (eventId ? "Event Requirement" : "Standalone");

    if (scope === "Event Requirement" && !eventId) {
      return res.status(400).json({ message: "An event is required for event-based medical records" });
    }

    const record = await MedicalRecord.create({
      scope,
      event: eventId,
      studentId,
      name,
      bloodType: normalizeText(req.body.bloodType) || "",
      conditions: normalizeText(req.body.conditions) || "",
      lastCheckup: normalizeText(req.body.lastCheckup) || "",
      status: normalizeStatus(req.body.status) || "Pending Review",
      documents,
      history,
    });

    const populated = await record.populate("event", "title date time location status");
    res.status(201).json(formatRecord(populated));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    if (req.body.studentId !== undefined) record.studentId = normalizeText(req.body.studentId) || record.studentId;
    if (req.body.name !== undefined) record.name = normalizeText(req.body.name) || record.name;
    if (req.body.scope !== undefined) {
      record.scope = normalizeScope(req.body.scope) || record.scope;
    }
    if (req.body.event !== undefined) {
      record.event = await normalizeObjectId(req.body.event, Event);
    }
    if (req.body.bloodType !== undefined) record.bloodType = normalizeText(req.body.bloodType);
    if (req.body.conditions !== undefined) record.conditions = normalizeText(req.body.conditions);
    if (req.body.lastCheckup !== undefined) record.lastCheckup = normalizeText(req.body.lastCheckup);
    if (req.body.status !== undefined) record.status = normalizeStatus(req.body.status) || record.status;

    if (record.scope === "Event Requirement" && !record.event) {
      return res.status(400).json({ message: "An event is required for event-based medical records" });
    }

    if (Array.isArray(req.body.documents)) {
      record.documents = normalizeDocuments(req.body.documents);
    }

    if (Array.isArray(req.body.history)) {
      record.history = req.body.history;
    }

    const updated = await record.save();
    await updated.populate("event", "title date time location status");
    res.json(formatRecord(updated));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    for (const doc of record.documents || []) {
      safeUnlink(doc.filePath);
    }

    await record.deleteOne();

    res.json({ message: "Medical record deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMyMedicalRecord = async (req, res) => {
  try {
    const { studentId, name } = await buildProfileIdentity(req.user);

    let record = await MedicalRecord.findOne({ studentId });

    if (!record) {
      record = await MedicalRecord.create({
        scope: "Standalone",
        event: null,
        studentId,
        name,
        status: "Pending Review",
        documents: [],
        history: [],
      });
    }

    const populated = await record.populate("event", "title date time location status");
    res.json(formatRecord(populated));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateMyMedicalRecord = async (req, res) => {
  try {
    const { studentId, name } = await buildProfileIdentity(req.user);
    let record = await MedicalRecord.findOne({ studentId });

    if (!record) {
      record = await MedicalRecord.create({
        scope: "Standalone",
        event: null,
        studentId,
        name,
        bloodType: "",
        conditions: "",
        lastCheckup: "",
        status: "Pending Review",
        documents: [],
        history: [],
      });
    }

    const body = req.body || {};

    const lastCheckup = body.lastCheckup !== undefined ? normalizeText(body.lastCheckup) : record.lastCheckup;
    const conditions = body.conditions !== undefined ? normalizeText(body.conditions) : record.conditions;
    const bloodType = body.bloodType !== undefined ? normalizeText(body.bloodType) : record.bloodType;
    const status = normalizeStatus(body.status) || "Pending Review";
    const scope = normalizeScope(body.scope) || record.scope;
    const eventId = body.event !== undefined ? await normalizeObjectId(body.event, Event) : record.event;
    const documentAttached = normalizeText(body.fileName) || normalizeText(body.documentAttached) || "None";

    if (body.name !== undefined) {
      record.name = normalizeText(body.name) || record.name;
    }

    record.scope = scope;
    record.event = eventId;

    if (record.scope === "Event Requirement" && !record.event) {
      return res.status(400).json({ message: "An event is required for event-based medical records" });
    }

    if (
      body.fileName !== undefined ||
      body.storedFileName !== undefined ||
      body.filePath !== undefined ||
      body.mimeType !== undefined ||
      body.fileSize !== undefined
    ) {
      const document = normalizeDocument({
        fileName: body.fileName,
        storedFileName: body.storedFileName,
        filePath: body.filePath,
        mimeType: body.mimeType,
        uploadDate: body.uploadDate || new Date().toISOString().split("T")[0],
        fileSize: body.fileSize,
      });

      if (document) {
        record.documents.push(document);
      }
    }

    record.lastCheckup = lastCheckup || "";
    record.conditions = conditions || "";
    record.bloodType = bloodType || "";
    record.status = status;
    record.history.unshift(buildHistoryEntry({
      checkupDate: lastCheckup,
      conditions,
      bloodType,
      status,
      documentAttached,
    }));

    const updated = await record.save();
    await updated.populate("event", "title date time location status");
    res.json(formatRecord(updated));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addMyMedicalDocument = async (req, res) => {
  try {
    const { studentId } = await buildProfileIdentity(req.user);
    const record = await MedicalRecord.findOne({ studentId });

    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    const body = req.body || {};

    const document = normalizeDocument({
      fileName: body.fileName,
      storedFileName: body.storedFileName,
      filePath: body.filePath,
      mimeType: body.mimeType,
      uploadDate: body.uploadDate || new Date().toISOString().split("T")[0],
      fileSize: body.fileSize,
    });
    if (!document) {
      return res.status(400).json({
        message: "A valid file is required",
      });
    }

    record.documents.push(document);
    const updated = await record.save();
    await updated.populate("event", "title date time location status");
    res.json(formatRecord(updated));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteMyMedicalDocument = async (req, res) => {
  try {
    const { studentId } = await buildProfileIdentity(req.user);
    const record = await MedicalRecord.findOne({ studentId });

    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    const targetDoc = record.documents.find((doc) => String(doc._id) === req.params.documentId);
    if (!targetDoc) {
      return res.status(404).json({ message: "Document not found" });
    }

    safeUnlink(targetDoc.filePath);
    record.documents = record.documents.filter((doc) => String(doc._id) !== req.params.documentId);
    const updated = await record.save();
    await updated.populate("event", "title date time location status");
    res.json(formatRecord(updated));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const downloadMyMedicalDocument = async (req, res) => {
  try {
    const { studentId } = await buildProfileIdentity(req.user);
    const record = await MedicalRecord.findOne({ studentId });

    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    const document = record.documents.find((doc) => String(doc._id) === req.params.documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const resolvedPath = resolveStoredPath(document.filePath);
    if (!resolvedPath || !fs.existsSync(resolvedPath)) {
      return res.status(404).json({ message: "Document file missing on server" });
    }

    return res.download(resolvedPath, document.fileName || document.storedFileName || "document");
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const downloadMedicalRecordDocument = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    const document = record.documents.find((doc) => String(doc._id) === req.params.documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const resolvedPath = resolveStoredPath(document.filePath);
    if (!resolvedPath || !fs.existsSync(resolvedPath)) {
      return res.status(404).json({ message: "Document file missing on server" });
    }

    return res.download(resolvedPath, document.fileName || document.storedFileName || "document");
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  getMyMedicalRecord,
  updateMyMedicalRecord,
  addMyMedicalDocument,
  deleteMyMedicalDocument,
  downloadMyMedicalDocument,
  downloadMedicalRecordDocument,
};
