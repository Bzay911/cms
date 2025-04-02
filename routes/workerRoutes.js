const express = require('express');
const { getWorkers, createWorker, getWorkerById, updateWorker, getfilters, getDocumentStatistics, getWorkersWithExpiredDocuments, getWorkersWithExpiringDocuments } = require('../controllers/workerController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Route to get all workers
router.get("/expired",authMiddleware, getWorkersWithExpiredDocuments);
router.get("/expiring",authMiddleware,getWorkersWithExpiringDocuments)

router.get('/document-statistics',authMiddleware, getDocumentStatistics);
router.get('/searchFilters', authMiddleware, getfilters);
router.get('/',authMiddleware, getWorkers);
router.get("/:id", authMiddleware, getWorkerById);
router.put("/:id", authMiddleware, updateWorker);

// Route to create a new worker
router.post('/',authMiddleware, createWorker);

module.exports = router;
