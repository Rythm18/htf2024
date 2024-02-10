const express = require('express')

const router = express.Router()
const { checkAuthenticated } = require('../middleware/auth')
const StaffController = require('../controllers/StaffController')

const { isStaff } = require('../middleware/role')

// view main staff dashboard
router.get(
  '/dashboard',
  checkAuthenticated,
  isStaff,
  StaffController.staffDashboard
)

// view staff complaints
router.get(
  '/complaints',
  checkAuthenticated,
  isStaff,
  StaffController.viewComplaints
)
router.post(
  '/aicomplains',
  checkAuthenticated,
  isStaff,
  StaffController.aicomplains
)

// reply to complaint by staff
router.post(
  '/complaints/feedback',
  checkAuthenticated,
  StaffController.complaintFeedback
)

module.exports = router
