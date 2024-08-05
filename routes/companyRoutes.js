const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// Company routes
router.post('/create', companyController.createCompany);
router.post('/login', companyController.companyLogin);
router.put('/edit/:id', companyController.editCompany);
router.delete('/delete/:id', companyController.deleteCompany);
router.post('/register-user', companyController.registerCompanyUser);
router.get('/:companyId/users', companyController.getCompanyUsers);

module.exports = router;
