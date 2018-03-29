var obj = require('./models/mymodel');

module.exports = {
    configure: function (app) {
        app.get('/companylist/:companyid', function (req, res) {
            obj.getAllList(res,'cfs_company', req.params.companyid);
        });
		app.get('/branchlist', function (req, res) {
            obj.getAllList(res,'cfs_branch');
        });
        app.get('/banklist/:id', function (req, res) {
            obj.getBankList(req.params.id, res);
        });
		/*app.get('/branchlist/:id', function (req, res) {
            obj.getBranchList(req.params.id, res);
        });*/
        app.get('/capexlist/:companyid', function (req, res) {
            obj.getAllList(res, 'cfs_capex_acc', req.params.companyid);
        });
		app.get('/clientlist', function (req, res) {
            obj.getAllList(res, 'cfs_benificiary');
        });
        app.get('/depositslist', function (req, res) {
            obj.getAllList(res, 'cfs_refundable_acc');
        });
        app.get('/provisionlist/:companyid', function (req, res) {
            obj.getAllList( res, 'cfs_provision_acc', req.params.companyid);
        });
        app.get('/drycamlist/:companyid', function (req, res) {
            obj.getAllList(res, 'cfs_prodry_acc', req.params.companyid);
        });
        app.get('/reimbursementlist/:cid', function (req, res) {
            obj.getReimbursementList(req.params.cid,res);
        });
		app.get('/reimbursementlistbycompanyid/:cid', function (req, res) {
            obj.checkIdExistOrNot("cfs_reimbursement", "company_id", req.params.cid, res);
        });
        app.get('/getbanklistwithcompany/:id/:cid', function (req, res) {
            obj.getBanklistWithCompany(req.params.id,res);
        });
        /******************added 27th oct 2017******************/
        app.get('/getBanklistWithCompanyBranch/:cid/:bid', function (req, res) {
            obj.getBanklistWithCompanyBranch(req.params.cid, req.params.bid, res);
        });
        /******************added 27th oct 2017******************/
        app.get('/getcompanylistforbank/:cid', function (req, res) {
            obj.getCompanyListForBank(req.params.cid, res);
        });
        app.get('/checkidexistornot/:tablename/:fieldname/:value', function (req, res) {
            obj.checkIdExistOrNot(req.params.tablename, req.params.fieldname, req.params.value, res);
        });

        /* Update Opening Balance */
        app.get('/updateopeningbalance/:table1/:table2/:field1/:field2', function (req, res) {
            obj.updateOpeningBalance(req.params.table1, req.params.table2, req.params.field1, req.params.field2, res);
        });
        /* Update Opening Balance */

        /* Update All List */
        app.post('/updateCompanyList/:id', function (req, res) {
            obj.updateAllList(req.params.id, req.body, 'cfs_company', 'id', res);
        });
        app.post('/updateCapexList/:id', function (req, res) {
            obj.updateAllList(req.params.id, req.body, 'cfs_capex_acc', 'capex_id', res);
        });
        app.post('/updateDepositList/:id', function (req, res) {
            obj.updateAllList(req.params.id, req.body, 'cfs_refundable_acc', 'refundable_id', res);
        });
        app.post('/updateProvisionList/:id', function (req, res) {
            obj.updateAllList(req.params.id, req.body, 'cfs_provision_acc', 'provision_id', res);
        });
        app.post('/updateDrycamList/:id', function (req, res) {
            obj.updateAllList(req.params.id, req.body, 'cfs_prodry_acc', 'prodry_id', res);
        });
        app.post('/updateReimList/:id', function (req, res) {
            obj.updateAllList(req.params.id, req.body, 'cfs_reimbursement', 'reimbursment_id', res);
        });
        app.post('/updateBankList/:id', function (req, res) {
            //obj.updateAllList(req.params.id, req.body, 'cfs_bankaccounts', 'id', res);
			obj.updateBranchId(req.params.id, req.body, 'cfs_bankaccounts', 'id', res);
        });
		app.post('/updateOperationList/:id', function (req, res) {
            obj.updateAllList(req.params.id, req.body, 'cfs_operation', 'id', res);
        });
		app.post('/updateOperationTransactionList/:id', function (req, res) {
            obj.updateAllList(req.params.id, req.body, 'cfs_operation_trans', 'transaction_id', res);
        });
		app.post('/updateClientList/:id', function (req, res) {
            obj.updateAllList(req.params.id, req.body, 'cfs_benificiary', 'id', res);
        });
        /* Update All List */
        
        /* Operation Start */
        app.get('/getoperationcompanyList/:companyid/:bankid', function (req, res) {
            obj.getOperationCompanyList(req.params.companyid, req.params.bankid, res);
        });
		app.get('/getOperationCompanyListByBranch/:companyid/:branchid', function (req, res) {
            obj.getOperationCompanyListByBranch(req.params.companyid, req.params.branchid, res);
        });
        /*************added on 24-10-2017*****************/
        app.get('/getCookieCompanyDetails/:companyid', function (req, res) {
            obj.getCookieCompanyDetails(req.params.companyid, res);
        });
        /*************added on 24-10-2017*****************/        
        app.get('/getoperationdetailsList/:companyid/:bankid', function (req, res) {
            obj.getOperationDetailsList(req.params.companyid, req.params.bankid, res);
        });
		app.get('/getOperationDetailsListByBranchId/:companyid/:branchid', function (req, res) {
            obj.getOperationDetailsListByBranchId(req.params.companyid, req.params.branchid, res);
        });
        app.post('/addoperationtransactiondata', function (req, res) {
            obj.addOperationMaster(req.body, res, 'cfs_operation_trans');
        });
		app.post('/addoperationtransactiondatawithtransfer', function (req, res) {
            obj.addOperationTransactionDataWithTransfer(req.body, res);
        });
        /***************added 27-10-2017*************/
        app.post('/addprovisiontransactiondatawithtransfer', function (req, res) {
            obj.addProvisionTransactionDataWithTransfer(req.body, res);
        });
        // app.get('/getoperationidbybranchbank/:companyid/:bankid/:branchid', function (req, res) {
        //     obj.getOperationIdByBranchBank(req.params.companyid, req.params.bankid, req.params.branchid, res);
        // });

        /***************added 27-10-2017*************/
        app.get('/getOperationCreditList/:id', function (req, res) {
            obj.getCreditDebitList(req.params.id, 'C', 'operation', res);
        });
        app.get('/getOperationDebitList/:id', function (req, res) {
            obj.getCreditDebitList(req.params.id, 'D', 'operation', res);
        });
		app.get('/deleteoperationtransactionlist/:id', function (req, res) {
            obj.deleteOperationTransactionList(req.params.id,res);
        });
        /* Operation End */

        /* Capex Start */
        app.get('/accountList/:companyid', function (req, res) {
            obj.getAllList(res, 'cfs_capex_acc', req.params.companyid);
        });
        app.get('/getcapexlist/:accountId/:companyid', function (req, res) {
            obj.getCapexList(req.params.accountId, req.params.companyid, res);
        });
        app.post('/addcapextransactiondata', function (req, res) {
            obj.addOperationMaster(req.body, res, 'cfs_capex_trans');
        });
        app.get('/getopeningbalance/:id', function (req, res) {
            obj.getOpeningBalance(req.params.id, res);
        });
        app.get('/getCapexCreditList/:id', function (req, res) {
            obj.getCreditDebitList(req.params.id, 'C', 'capex', res);
        });
        app.get('/getCapexDebitList/:id', function (req, res) {
            obj.getCreditDebitList(req.params.id, 'D', 'capex', res);
        });
        /* Capex End */

        /* Deposits Start */
        app.get('/depositaccountList', function (req, res) {
            obj.getAllList(res, 'cfs_refundable_acc');
        });
        app.get('/getdepositlist/:id', function (req, res) {
            obj.getDepositList(req.params.id, res);
        });
        app.post('/adddeposittransactiondata', function (req, res) {
            obj.addOperationMaster(req.body, res, 'cfs_refundable_trans');
        });
        app.get('/getDepositCreditList/:id', function (req, res) {
            obj.getCreditDebitList(req.params.id, 'C', 'deposit', res);
        });
        app.get('/getDepositDebitList/:id', function (req, res) {
            obj.getCreditDebitList(req.params.id, 'D', 'deposit', res);
        });
        /* Deposits End */

        /* Dry Cam Start */
        app.get('/drycamaccountList', function (req, res) {
            obj.getAllList(res, 'cfs_prodry_acc');
        });
        app.get('/getdrycamlist/:id', function (req, res) {
            obj.getDrycamList(req.params.id, res);
        });
        app.post('/adddrycamtransactiondata', function (req, res) {
            obj.addOperationMaster(req.body, res, 'cfs_prodry_trans');
        });
        app.get('/getDrycamCreditList/:id', function (req, res) {
            obj.getCreditDebitList(req.params.id, 'C', 'drycam', res);
        });
        app.get('/getDrycamDebitList/:id', function (req, res) {
            obj.getCreditDebitList(req.params.id, 'D', 'drycam', res);
        });
        /* Dry Cam End */

        /* Provision Start */
        app.get('/provisionaccountList/:companyid', function (req, res) {
            obj.getAllList(res, 'cfs_provision_acc', req.params.companyid);
        });
        app.get('/getprovisionlist/:id/:companyid', function (req, res) {
            obj.getProvisionList(req.params.id, req.params.companyid, res);
        });
        app.post('/addprovisiontransactiondata', function (req, res) {
            obj.addOperationMaster(req.body, res, 'cfs_provision_trans');
        });
        app.get('/getProvisionCreditList/:id', function (req, res) {
            obj.getCreditDebitList(req.params.id, 'C', 'provision', res);
        });
        app.get('/getProvisionDebitList/:id', function (req, res) {
            obj.getCreditDebitList(req.params.id, 'D', 'provision', res);
        });
		//New Function..
		app.get('/getProvisionTransactionList/:type/:companyid', function (req, res) {
            obj.getProvisionTransactionList(req.params.type, req.params.companyid, res);
        });
        /* Provision End */

        /* Reimbursement Start */
        app.get('/reimlistbyid/:id', function (req, res) {
            obj.reimListById(req.params.id, res);
        });
        app.get('/getreimbursementlist/:id', function (req, res) {
            obj.getReimList(req.params.id, res);
        });
        app.get('/getreimbursementdetailslist/:companyId/:reimId', function (req, res) {
            obj.getReimDetailsList(req.params.companyId, req.params.reimId, res);
        });
        app.post('/addreimbursementtransactiondata', function (req, res) {
            obj.addOperationMaster(req.body, res, 'cfs_reim_trans');
        });
        app.get('/getReimCreditList/:id', function (req, res) {
            obj.getCreditDebitList(req.params.id, 'C', 'reim', res);
        });
        app.get('/getReimDebitList/:id', function (req, res) {
            obj.getCreditDebitList(req.params.id, 'D', 'reim', res);
        });
        /* Reimbursement End */

        /* Transaction Start */
        app.get('/getreimbursementbalance/:companyId/:month', function (req, res) {
            obj.getReimbursementBalance(req.params.companyId, req.params.month, res);
        });
        app.get('/getbalancebycompanyid/:companyId/:month', function (req, res) {
            obj.getBalanceByCompanyId(req.params.companyId, req.params.month, res);
        });
		app.get('/getTransactionDetailsList/:companyId/:branchId/:startdate/:enddate', function (req, res) {
            obj.getTransactionDetailsList(req.params.companyId, req.params.branchId, req.params.startdate, req.params.enddate, res);
        });
        /* Transaction End */

        /* Configuration : Add Master Table */
        app.post('/addoperationmaster', function (req, res) {
            obj.addOperationMaster(req.body, res, 'cfs_operation');
        });
        app.post('/addcompanymaster', function (req, res) {
            obj.addOperationMaster(req.body, res, 'cfs_company');
        });
        app.post('/addcapexmaster', function (req, res) {
            obj.addOperationMaster(req.body, res, 'cfs_capex_acc');
        });
		app.post('/addclientmaster', function (req, res) {
            obj.addOperationMaster(req.body, res, 'cfs_benificiary');
        });
        app.post('/adddepositsmaster', function (req, res) {
            obj.addOperationMaster(req.body, res, 'cfs_refundable_acc');
        });
        app.post('/addreimbursementmaster', function (req, res) {
            obj.addOperationMaster(req.body, res, 'cfs_reimbursement');
        });
        app.post('/addprovisionmaster', function (req, res) {
            obj.addOperationMaster(req.body, res, 'cfs_provision_acc');
        });
        app.post('/adddrycammaster', function (req, res) {
            obj.addOperationMaster(req.body, res, 'cfs_prodry_acc');
        });
        app.post('/addbankmaster/:id', function (req, res) {
            obj.addBankMaster(req.params.id, req.body, res);
        });
        /* Configuration : End */

        /* Others */
        app.post('/loginvalidate', function (req, res) {
            obj.loginvalidatechecking(req.body, res);
        });
        app.get('/getcompanyname/:id', function (req, res) {
            obj.getCompanyName(req.params.id, res);
        });
        app.get('/getBenificiaryList', function (req, res) {
            obj.getAllList(res, 'cfs_benificiary');
        });
        /* End */
        
    }
};
