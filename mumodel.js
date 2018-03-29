var connection = require('../connection');

function myModel() {
    /* Some Common Functions Start */
    this.getAllList = function (res, tablename, companyId) {
        connection.acquire(function (err, con) {            
            var sql = "select * from " + tablename + " where status='A' ";
            if (companyId > 0) {
                if(tablename == 'cfs_company'){
                    sql += " and id=" + companyId;
                }
                else{
                    sql += " and company_id=" + companyId;
                }                
            }  
           // console.log(sql)          
            var query = con.query(sql, function (err, result) {
                con.release();
                res.send(result);
            });
        });
    };

    this.checkIdExistOrNot = function (tablename, fieldname, value, res) {
        connection.acquire(function (err, con) {
            var query = con.query("select * from " + tablename + " where "+fieldname+"="+value, function (err, result) {
                con.release();
                res.send(result);
            });
        });
    };

    this.updateAllList = function (id, data, tablename, fieldname, res) {
        connection.acquire(function (err, con) {
            var query = con.query("UPDATE " + tablename + " SET ? where "+fieldname+"=? ", [data, id], function (err, result) {
                con.release();
                res.send(result);
            });
            //console.log(query.sql);
        });
    };
	
	this.updateBranchId = function (id, data, tablename, fieldname, res) {
        connection.acquire(function (err, con) {
			var query = con.query("UPDATE " + tablename + " SET ? where "+fieldname+"=? ", [data, id], function (err, result) {
                con.query("UPDATE cfs_operation SET branch_id="+data.branch_id+" where bankacc_id="+id+" and company_id= "+data.company_id,function (err, result) {
					con.release();
					res.send(result);
				});
            });
        });
    };

    this.addOperationMaster = function (req, res, tablename) {
        connection.acquire(function (err, con) {
            var query = con.query('insert into `' + tablename + '` set ?', req, function (err, result) {
                 //console.log(query.sql);
                con.release();
                if (err) {
                    res.send({ status: false, message: 'Insert failed' });
                } else {
                    res.send({ status: true, message: 'Inserted successfully', 'lastInsertid' : result.insertId });
                }
            });
        });
    };
	//Add Operation transaction as well as add transfer amount to another account
	this.addOperationTransactionDataWithTransfer = function (req, res) {
        connection.acquire(function (err, con) {
			var data = { operation_id: req.operation_id, 
						 beneficiary_id: req.beneficiary_id,
						 trans_type: req.trans_type, 						  
						 amount : req.amount,
						 remark:req.remark,
						 transfered_account_type_id: req.seltransferaccount
						};
				
			var table1= req.table1;
			var table2= req.table2;
			var field1= req.field1;
			
            var query = con.query('insert into `cfs_operation_trans` set ?', data, function (err, result) {
				if(req.particularsId == 0)
				{	
					if(req.seltransferaccount==3){
						var data1 = { company_id: req.company_id, acc_name: req.particulars, op_balance: 0.0 };
					}else{
						var data1 = { acc_name: req.particulars, op_balance: 0.0 };
					}
			 		var query1 = con.query('insert into '+table1+' set ?', data1, function (err, result1) {
					
						if(req.seltransferaccount==3){
							var data2 = { reimburstment_id: result1.insertId, 
										 trans_type: 'C',
										 benificiary_id: req.beneficiary_id,
										 amount: req.amount
										};
						}else if(req.seltransferaccount==1){
							var data2 = { provision_id: result1.insertId, 
                                         company_id: req.company_id,
										 trans_type: 'C',
										 beneficiary_id: req.beneficiary_id,
										 amount: req.amount,
										 transfered_acc_id: result.insertId
										};
						}
						else if(req.seltransferaccount==2){
							var data2 = { prodry_id: result1.insertId, 
                                         company_id: req.company_id,
										 trans_type: 'C',
										 beneficiary_id: req.beneficiary_id,
										 amount: req.amount
										};
						}
						var query2 = con.query('insert into '+table2+' set ?', data2, function (err, result2) {
							con.release();
							if (err) {
								res.send({ status: false, message: 'Insert failed' });
							} else {
								res.send({ status: true, message: 'Inserted successfully', 'lastInsertid' : result2.insertId });
							}
						});
						//console.log(query2.sql);
					});
					//console.log(query1.sql);
				}
				if(req.particularsId > 0)
				{
						if(req.seltransferaccount==3){
							var data2 = { reimburstment_id: req.particularsId, 
										 trans_type: 'C',
										 benificiary_id: req.beneficiary_id,
										 remark: req.remark,
										 amount: req.amount
										};
						}else if(req.seltransferaccount==1){
							var data2 = { provision_id: req.particularsId, 
                                         company_id: req.company_id,
										 trans_type: 'C',
										 beneficiary_id: req.beneficiary_id,
										 remark: req.remark,
										 amount: req.amount,
										 transfered_acc_id: result.insertId
										};
						}
						else if(req.seltransferaccount==2){
							var data2 = { prodry_id: req.particularsId, 
                                         company_id: req.company_id,
										 trans_type: 'C',
										 beneficiary_id: req.beneficiary_id,
										 remark: req.remark,
										 amount: req.amount
										};
						}
						var query2 = con.query('insert into '+table2+' set ?', data2, function (err, result2) {
							con.release();
							if (err) {
								res.send({ status: false, message: 'Insert failed' });
							} else {
								res.send({ status: true, message: 'Inserted successfully', 'lastInsertid' : result2.insertId });
							}
						});
					  // console.log(query2.sql);
				}
            });
			//console.log(query.sql);
        });
    };

    this.addBankMaster = function (id, req, res) { 
        connection.acquire(function (err, con) {
            var query = con.query('insert into cfs_bankaccounts set ?', req, function (err, result) {
                var data = { company_id: id, bankacc_id: result.insertId, branch_id: req.branch_id, op_balance : 0.0 };
                var query1 = con.query('insert into cfs_operation set ?', data, function (err, result1) {
					con.release();
					if (err) {
						res.send({ status: false, message: 'Insert failed' });
					} else {
						res.send({ status: true, message: 'Inserted successfully' });
					}
                });
            });
        });
    };

    this.loginvalidatechecking = function (req, res) {
        connection.acquire(function (err, con) {
            var query = con.query('select * from cfs_user where username = ? and passwd = ?', [req.username, req.password], function (err, result) {
                con.release();
                if (err) {
                    res.send({ status: false, userid: 0, message: 'Login failed' });
                } else {
                    if (result.length > 0)
                        res.send({ status: true, userid: result[0].id, username: result[0].name, company_id: result[0].company_id, message: 'Login successfull' });
                    else
                        res.send({ status: false, userid: 0, message: 'Login error' });
                }
            });
        });
    };

    this.getCompanyName = function (id, res) {
        connection.acquire(function (err, con) {
            var query = con.query("select * from cfs_company where id=? and status='A'", [id], function (err, result) {
                con.release();
                res.send(result[0].name);
            });
        });
    };

    this.updateOpeningBalance = function (table1, table2, field1, field2, res) {
        connection.acquire(function (err, con) {
				var sql_2="(SELECT max(date_updated) as lastupdate FROM " + table1 + ")";
				var sql = "SELECT " + field2 + " as ID, SUM(COALESCE(CASE WHEN trans_type = 'C' THEN amount END,0)) total_credits, SUM(COALESCE(CASE WHEN trans_type = 'D' THEN amount END,0)) total_debits FROM " + table2 + " where date_created > " + sql_2 + " and date_created < curdate() GROUP BY " + field2 ;
				//console.log(sql);
				
				var query1 = con.query(sql, function (err, result1) {
					if(result1.length > 0){
						for (var i = 0; i < result1.length; i++) {
							var opbal = (result1[i].total_credits - result1[i].total_debits);
							//var data = { op_balance: opbal, date_updated: new Date() };
							var data = { date_updated: new Date() };
							if (result1[i].ID > 0) {
								var query2 = con.query("update " + table1 + " set op_balance = op_balance + ("+opbal+"), ? where " + field1 + " = ? ", [data, result1[i].ID], function (err, result2) { });
								//console.log(query2.sql);
							}
						}
					}
					con.release();//added
					res.send("success");//added
				});
				
       });
            
    };
    /* Some Common Functions End */

    this.getReimbursementList = function (companyId, res) {
        connection.acquire(function (err, con) {
            var sql = "SELECT A.*, B.name FROM `cfs_reimbursement` A, cfs_company B where A.company_id = B.id and A.status='A'";
            if (companyId > 0) {
                sql += " and B.id=" + companyId;
            }
            var query = con.query(sql, function (err, result) {
                con.release();
                res.send(result);
            });           
           
        });
    };

    this.getBankList = function (id, res) {
        connection.acquire(function (err, con) {
            var query = con.query('select * from cfs_bankaccounts where company_id=?', [id], function (err, result) {
                con.release();
                res.send(result);
            });
        });
    };
	
	 this.getBranchList = function (id, res) {
        connection.acquire(function (err, con) {
            var query = con.query('SELECT A.*,B.branch_name FROM `cfs_bankaccounts` A, cfs_branch B where A.branch_id=B.id and A.company_id=?', [id], function (err, result) {
                con.release();
                res.send(result);
            });
        });
    };
	

    this.getBanklistWithCompany = function (id, res) {
        connection.acquire(function (err, con) {
            var query = con.query("SELECT A.*,B.name,B.code,C.branch_name FROM `cfs_bankaccounts` A, cfs_company B, cfs_branch C where A.company_id = B.id and A.branch_id = C.id and B.status='A' and C.status='A' and A.company_id="+id, function (err, result) {
                con.release();
                res.send(result);
            });
        });
    };
    /*********************added 27-10-2017*****************/
    this.getBanklistWithCompanyBranch = function (cid, bid, res) {
        connection.acquire(function (err, con) {
           // console.log("SELECT A.*,B.name,B.code,C.branch_name FROM `cfs_bankaccounts` A, cfs_company B, cfs_branch C ,cfs_operation D where A.company_id = B.id and A.branch_id = C.id and A.id = D.bankacc_id and D.status = 'A' and B.status='A' and C.status='A' and A.company_id="+cid+" and A.branch_id="+bid)
            var query = con.query("SELECT A.*,B.name,B.code,C.branch_name FROM `cfs_bankaccounts` A, cfs_company B, cfs_branch C ,cfs_operation D where A.company_id = B.id and A.branch_id = C.id and A.id = D.bankacc_id and D.status = 'A' and B.status='A' and C.status='A' and A.company_id="+cid+" and A.branch_id="+bid, function (err, result) {
                con.release();
                res.send(result);
            });
        });
    };

    this.getCompanyListForBank = function (cid, res) {
        connection.acquire(function (err, con) {
            var sql = "SELECT A.company_id,B.name,B.code FROM `cfs_bankaccounts` A, cfs_company B where A.company_id = B.id and B.status='A'";
            if (cid > 0) {
                sql += " and B.id = " + cid ;
            }
            sql += " GROUP BY A.company_id";
            //console.log(sql);
            var query = con.query(sql, function (err, result) {
                con.release();
                res.send(result);
            });
        });
    };

    /* Operation Functions Start */
    this.getOperationCompanyList = function (companyId, bankId, res) {
        //module.exports.updateOpeningBalance('cfs_operation', 'cfs_operation_trans', 'id', 'operation_id');
        connection.acquire(function (err, con) {
            var sql = "SELECT id,name,code FROM `cfs_company` where id in ( select DISTINCT company_id from cfs_operation where status='A'";
            if (companyId > 0) {
                sql += " and company_id=" + companyId;
            }
            if (bankId > 0) {
                sql += " and bankacc_id=" + bankId;
            }
            sql += " )";
            var query = con.query(sql, function (err, result) {
                con.release();
                res.send(result);
            });
        });
    };
	this.getOperationCompanyListByBranch = function (companyId, branchId, res) {
        //module.exports.updateOpeningBalance('cfs_operation', 'cfs_operation_trans', 'id', 'operation_id');
        connection.acquire(function (err, con) {
            var sql = "SELECT id,name,code FROM `cfs_company` where id in ( select DISTINCT company_id from cfs_operation where status='A'";
            if (companyId > 0) {
                sql += " and company_id=" + companyId;
            }
            if (branchId > 0) {
                sql += " and branch_id=" + branchId;
            }
            sql += " )";
            var query = con.query(sql, function (err, result) {
                con.release();
                res.send(result);
            });
        });
    };
    /*************added on 24-10-2017*****************/
    this.getCookieCompanyDetails = function (companyId,res) {
        //module.exports.updateOpeningBalance('cfs_operation', 'cfs_operation_trans', 'id', 'operation_id');
        connection.acquire(function (err, con) {
            var sql = "SELECT id,name,code FROM `cfs_company` where id=" + companyId;            
           
            var query = con.query(sql, function (err, result) {
                con.release();
                res.send(result);
            });
        });
    };
    /*************added on 24-10-2017*****************/
    this.getOperationDetailsList = function (companyId, bankId,  res) {
        connection.acquire(function (err, con) {
            var sql = "SELECT A.*,B.*,C.bname,D.branch_name FROM `cfs_operation` A left join (SELECT operation_id as operationId, SUM(COALESCE(CASE WHEN trans_type = 'D' THEN amount END,0)) total_debits, SUM(COALESCE(CASE WHEN trans_type = 'C' THEN amount END,0)) total_credits from cfs_operation_trans where DATE(date_created) = CURDATE() group by operationId) B on A.id=B.operationId left join cfs_bankaccounts C on A.bankacc_id = C.id left join cfs_branch D on A.branch_id = D.id where A.status='A' and A.company_id=" + companyId;
            if (bankId > 0) {
                sql += " AND A.bankacc_id=" + bankId;
            }
            // if (branchId > 0) {
            //     sql += " AND A.branch_id=" + branchId;
            // }
           // console.log(sql);
            var query = con.query(sql, function (err, result) {
                con.release();
                res.send(result);
            });
        });
    };
	
	this.getTransactionDetailsList = function (companyId, branchId, startdate, enddate, res) {
        connection.acquire(function (err, con) {
            var sql = "SELECT A.company_id,A.bankacc_id,A.branch_id,C.branch_name,D.name,E.bname,B.* From cfs_operation A, cfs_operation_trans B, cfs_branch C, cfs_benificiary D, cfs_bankaccounts E where A.id=B.operation_id and A.branch_id=C.id and B.beneficiary_id=D.id and A.bankacc_id=E.id and A.company_id=" + companyId;
			if(branchId > 0){
				sql += " and A.branch_id="+branchId;	
			}
			if(startdate!='0000-00-00'){
				startdate=startdate+' 00:00:00';
				sql +=" and B.date_created >= '"+startdate+"'";
			}
			if(enddate!='0000-00-00'){
				enddate=enddate+' 23:59:59';
				sql +=" and B.date_created<='"+enddate+"'";
			}
            sql +=" order by B.date_created desc";
            var query = con.query(sql, function (err, result) {
                con.release();
                res.send(result);
            });
			//console.log(query.sql);
        });
    };
	
	this.getOperationDetailsListByBranchId = function (companyId, branchId, res) {
        connection.acquire(function (err, con) {
            var sql = "SELECT A.*,B.*,C.bname,D.branch_name FROM `cfs_operation` A left join (SELECT operation_id as operationId, SUM(COALESCE(CASE WHEN trans_type = 'D' THEN amount END,0)) total_debits, SUM(COALESCE(CASE WHEN trans_type = 'C' THEN amount END,0)) total_credits from cfs_operation_trans where DATE(date_created) = CURDATE() group by operationId) B on A.id=B.operationId left join cfs_bankaccounts C on A.bankacc_id = C.id left join cfs_branch D on A.branch_id = D.id where A.status='A' and A.company_id=" + companyId;
            if (branchId > 0) {
                sql += " AND A.branch_id=" + branchId;
            }
            var query = con.query(sql, function (err, result) {
                con.release();
                res.send(result);
            });
        });
    };

    this.getCreditDebitList = function (id, type, table, res) {
        connection.acquire(function (err, con) {
            if (table == "operation") {
                var sql = "SELECT A.*, B.company_id, B.bankacc_id, C.name, C.code, D.bname, D.bcode, E.name as clientname FROM `cfs_operation_trans` A, cfs_operation B, cfs_company C, cfs_bankaccounts D, cfs_benificiary E where A.operation_id=B.id and DATE(A.date_created) = CURDATE() and A.trans_type='" + type + "' and B.company_id=C.id and B.bankacc_id=D.id and A.beneficiary_id = E.id and A.operation_id=" + id + " ORDER BY A.date_created";
               // console.log(sql);
            }
            if (table == "capex") {
                var sql = "SELECT A.*, B.acc_name, E.name as clientname FROM `cfs_capex_trans` A, cfs_capex_acc B, cfs_benificiary E where A.capex_id=B.capex_id and DATE(A.date_created) = CURDATE() and A.trans_type='"+type+"' and A.beneficiary_id = E.id and A.capex_id="+id+" ORDER BY A.date_created";
            }
            if (table == "deposit") {
                var sql = "SELECT A.*, B.acc_name, E.name as clientname FROM `cfs_refundable_trans` A, cfs_refundable_acc B, cfs_benificiary E where A.refundable_id=B.refundable_id and DATE(A.date_created) = CURDATE() and A.trans_type='" + type + "' and A.beneficiary_id = E.id and A.refundable_id=" + id + " ORDER BY A.date_created";
            }
            if (table == "drycam") {
                var sql = "SELECT A.*, B.acc_name, E.name as clientname FROM `cfs_prodry_trans` A, cfs_prodry_acc B, cfs_benificiary E where A.prodry_id=B.prodry_id and DATE(A.date_created) = CURDATE() and A.trans_type='" + type + "' and A.beneficiary_id = E.id and A.prodry_id=" + id + " ORDER BY A.date_created";
            }
            if (table == "provision") {
                var sql = "SELECT A.*, B.acc_name, E.name as clientname FROM `cfs_provision_trans` A, cfs_provision_acc B, cfs_benificiary E where A.provision_id=B.provision_id and DATE(A.date_created) = CURDATE() and A.trans_type='" + type + "' and A.beneficiary_id = E.id and A.provision_id=" + id + " ORDER BY A.date_created";
            }
            if (table == "reim") {
                var sql = "SELECT A.*, B.acc_name, B.company_id, C.name, C.code, E.name as clientname FROM `cfs_reim_trans` A, cfs_reimbursement B, cfs_company C, cfs_benificiary E where A.reimburstment_id=B.reimbursment_id and B.company_id = C.id  and DATE(A.date_created) = CURDATE() and A.trans_type='" + type + "' and A.benificiary_id = E.id and A.reimburstment_id=" + id + " ORDER BY A.date_created";
            }
            var query = con.query(sql, function (err, result) {
                con.release();
                res.send(result);
            });
            //console.log(query.sql);
        });
    };
    /* Operation Functions End */

    /* Capex Functions Start */
    this.getCapexList = function (accountId, companyId, res) {
        //module.exports.updateOpeningBalance('cfs_capex_acc', 'cfs_capex_trans', 'capex_id', 'capex_id');
        connection.acquire(function (err, con) {
            var sql = "SELECT * FROM `cfs_capex_acc` A "+
                      "left join (SELECT capex_id as capexId, SUM(COALESCE(CASE WHEN trans_type = 'D' THEN amount END,0)) total_debits, " +
                      "SUM(COALESCE(CASE WHEN trans_type = 'C' THEN amount END,0)) total_credits from cfs_capex_trans where DATE(date_created) = CURDATE() group by capexId) B " +
                      "on A.capex_id=B.capexId where A.status='A'";
            if (accountId > 0) {
                sql += " AND A.capex_id = " + accountId;
            }
            if (companyId > 0) {
                sql += " AND A.company_id = " + companyId;
            }
            var query = con.query(sql, function (err, result) {
                con.release();
                res.send(result);
            });
        });
    };
    /* Capex Functions End */

    /* Deposit Functions Start */
    this.getDepositList = function (id, res) {
        //module.exports.updateOpeningBalance('cfs_refundable_acc', 'cfs_refundable_trans', 'refundable_id', 'refundable_id');
        connection.acquire(function (err, con) {
            var sql = "SELECT * FROM `cfs_refundable_acc` A " +
                      "left join (SELECT refundable_id as refundableId, SUM(COALESCE(CASE WHEN trans_type = 'D' THEN amount END,0)) total_debits, " +
                      "SUM(COALESCE(CASE WHEN trans_type = 'C' THEN amount END,0)) total_credits from cfs_refundable_trans where DATE(date_created) = CURDATE() group by refundableId) B " +
                      "on A.refundable_id=B.refundableId where A.status='A'";
            if (id > 0) {
                sql += " AND A.refundable_id = " + id;
            }
            var query = con.query(sql, function (err, result) {
                con.release();
                res.send(result);
            });
        });
    };
    /* Deposit Functions End */

    /* Dry Cam Functions Start */
    this.getDrycamList = function (id, res) {
        //module.exports.updateOpeningBalance('cfs_prodry_acc', 'cfs_prodry_trans', 'prodry_id', 'prodry_id');
        connection.acquire(function (err, con) {
            var sql = "SELECT * FROM `cfs_prodry_acc` A " +
                      "left join (SELECT prodry_id as prodryId, SUM(COALESCE(CASE WHEN trans_type = 'D' THEN amount END,0)) total_debits, " +
                      "SUM(COALESCE(CASE WHEN trans_type = 'C' THEN amount END,0)) total_credits from cfs_prodry_trans where DATE(date_created) = CURDATE() group by prodryId) B " +
                      "on A.prodry_id=B.prodryId where A.status='A'";
            if (id > 0) {
                sql += " AND A.prodry_id = " + id;
            }
            var query = con.query(sql, function (err, result) {
                con.release();
                res.send(result);
            });
        });
    };
    /* Dry Cam Functions End */

    /* Provision Start */
    this.getProvisionList = function (id, companyid, res) {
        //module.exports.updateOpeningBalance('cfs_provision_acc', 'cfs_provision_trans', 'provision_id', 'provision_id');
        connection.acquire(function (err, con) {
            var sql = "SELECT * FROM `cfs_provision_acc` A " +
                      "left join (SELECT provision_id as provisionId, transfered_acc_id, SUM(COALESCE(CASE WHEN trans_type = 'D' THEN amount END,0)) total_debits, " +
                      "SUM(COALESCE(CASE WHEN trans_type = 'C' THEN amount END,0)) total_credits from cfs_provision_trans where DATE(date_created) = CURDATE() group by provisionId) B " +
                      "on A.provision_id=B.provisionId where A.status='A'";
            if (id > 0) {
                sql += " AND A.provision_id = " + id;
            }
             if (companyid > 0) {
                sql += " AND A.provision_id = " + id;
            }
            var query = con.query(sql, function (err, result) {
                con.release();
                res.send(result);
            });
        });
    };
	
	 this.getProvisionTransactionList = function (type, companyId, res) {
        connection.acquire(function (err, con) {
            var sql = "SELECT A.*,B.acc_name,C.name FROM `cfs_provision_trans` A, cfs_provision_acc B, cfs_benificiary C where A.provision_id=B.provision_id and B.status='A' and A.beneficiary_id=C.id ";
            if (type =='C' || type=='D') {
                sql += " AND A.trans_type = '"+type+"' ";
            }
            if(companyId>0){
                sql += " AND B.company_id = '"+companyId+"' ";
            }
			sql +=" order by A.date_created desc";
   
            var query = con.query(sql, function (err, result) {
                con.release();
                res.send(result);
            });
        });
    };
    this.getOperationIdByBranchBank = function (type, companyId, bankid, branchid, res) {
        connection.acquire(function (err, con) {
            var sql = "SELECT * FROM `cfs_operation` where status='A' AND company_id = '" + companyId + "' AND bankacc_id = '" + bankid + "' AND branch_id = '" + branchid + "' ";
            
            sql +=" LIMIT 1";
              // console.log(sql);
            var query = con.query(sql, function (err, result) {
                con.release();
                res.send(result);
            });
        });
    };
    
    //Add Provision transaction as well as add transfer amount to another account
    this.addProvisionTransactionDataWithTransfer = function (req, res) {
        connection.acquire(function (err, con) {
            var data = { operation_id: req.operation_id, 
                         beneficiary_id: req.beneficiary_id,
                         trans_type: req.trans_type,                          
                         amount : req.amount,
                         remark:req.remark,
                         transfered_account_type_id: req.seltransferaccount
                        };
                
            var table1= req.table1;
            var table2= req.table2;
            var field1= req.field1;
            
            var query = con.query('insert into `cfs_operation_trans` set ?', data, function (err, result) {
                if(req.particularsId == 0)
                {   
                    if(req.seltransferaccount==3){
                        var data1 = { company_id: req.company_id, acc_name: req.particulars, op_balance: 0.0 };
                    }else{
                        var data1 = { acc_name: req.particulars, op_balance: 0.0 };
                    }
                    var query1 = con.query('insert into '+table1+' set ?', data1, function (err, result1) {
                    
                        if(req.seltransferaccount==3){
                            var data2 = { reimburstment_id: result1.insertId, 
                                         trans_type: 'D',
                                         benificiary_id: req.beneficiary_id,
                                         amount: req.amount
                                        };
                        }else if(req.seltransferaccount==1){
                            var data2 = { provision_id: result1.insertId, 
                                         company_id: req.company_id,
                                         trans_type: 'D',
                                         beneficiary_id: req.beneficiary_id,
                                         amount: req.amount,
                                         transfered_acc_id: result.insertId
                                        };
                        }
                        else if(req.seltransferaccount==2){
                            var data2 = { prodry_id: result1.insertId, 
                                         company_id: req.company_id,
                                         trans_type: 'D',
                                         beneficiary_id: req.beneficiary_id,
                                         amount: req.amount
                                        };
                        }
                        var query2 = con.query('insert into '+table2+' set ?', data2, function (err, result2) {
                            con.release();
                            if (err) {
                                res.send({ status: false, message: 'Insert failed' });
                            } else {
                                res.send({ status: true, message: 'Inserted successfully', 'lastInsertid' : result2.insertId });
                            }
                        });
                       // console.log(query2.sql);
                    });
                  //  console.log(query1.sql);
                }
                if(req.particularsId > 0)
                {
                        if(req.seltransferaccount==3){
                            var data2 = { reimburstment_id: req.particularsId, 
                                         trans_type: 'D',
                                         benificiary_id: req.beneficiary_id,
                                         remark: req.remark,
                                         amount: req.amount
                                        };
                        }else if(req.seltransferaccount==1){
                            var data2 = { provision_id: req.particularsId, 
                                         company_id: req.company_id,
                                         trans_type: 'D',
                                         beneficiary_id: req.beneficiary_id,
                                         remark: req.remark,
                                         amount: req.amount,
                                         transfered_acc_id: result.insertId
                                        };
                        }
                        else if(req.seltransferaccount==2){
                            var data2 = { prodry_id: req.particularsId, 
                                         company_id: req.company_id,
                                         trans_type: 'D',
                                         beneficiary_id: req.beneficiary_id,
                                         remark: req.remark,
                                         amount: req.amount
                                        };
                        }
                        var query2 = con.query('insert into '+table2+' set ?', data2, function (err, result2) {
                            con.release();
                            if (err) {
                                res.send({ status: false, message: 'Insert failed' });
                            } else {
                                res.send({ status: true, message: 'Inserted successfully', 'lastInsertid' : result2.insertId });
                            }
                        });
                     //  console.log(query2.sql);
                }
            });
          //  console.log(query.sql);
        });
    };
    /* Provision End */

    /* Reimbursement Start */
    this.reimListById = function (id, res) {
        connection.acquire(function (err, con) {
            var query = con.query("SELECT A.*, B.name FROM `cfs_reimbursement` A, cfs_company B where A.company_id = B.id and A.status='A' and A.company_id=?", [id], function (err, result) {
                con.release();
                res.send(result);
            });
        });
    };

    this.getReimList = function (id, res) {
        //module.exports.updateOpeningBalance('cfs_reimbursement', 'cfs_reim_trans', 'reimbursment_id', 'reimburstment_id');
        connection.acquire(function (err, con) {
            var sql = "SELECT id,name FROM `cfs_company` where id in ( select DISTINCT company_id from cfs_reimbursement where status='A'";
            if (id > 0) {
                sql += " and company_id=" + id;
            }
            sql += " ) and status='A'";
            var query = con.query(sql, function (err, result) {
                con.release();
                res.send(result);
            });
        });
    };

    this.getReimDetailsList = function (companyId, reimId, res) {
        connection.acquire(function (err, con) {
            var sql = "SELECT * FROM `cfs_reimbursement` A " +
                    " left join (SELECT reimburstment_id as reimbursementId,"+
                    " SUM(COALESCE(CASE WHEN trans_type = 'D' THEN amount END,0)) total_debits, " +
                    " SUM(COALESCE(CASE WHEN trans_type = 'C' THEN amount END,0)) total_credits "+
                    " from cfs_reim_trans where DATE(date_created) = CURDATE() group by reimbursementId) B " +
                    " on A.reimbursment_id=B.reimbursementId where A.status='A'  and A.company_id=" + companyId;
            if (reimId > 0) {
                sql += " AND A.reimbursment_id=" + reimId;
            }
            var query = con.query(sql, function (err, result) {
                con.release();
                res.send(result);
            });
        });
    };
    /* Reimbursement End */

    /* Transaction Start */
    this.getReimbursementBalance = function (companyId, month, res) {
        connection.acquire(function (err, con) {
            var sql = "SELECT A.*,B.trans_type,B.date_created as created_date,B.amount from `cfs_reimbursement` A left join `cfs_reim_trans` B on A.reimbursment_id=B.reimburstment_id where MONTH(B.date_created)=" + month+" and A.company_id="+companyId;
            var query = con.query(sql, function (err, result) {
                con.release();
                var total_credit = 0, total_debit = 0;
                for (var i = 0; i < result.length; i++) {
                    if (result[i].trans_type == 'C')
                        total_credit += result[i].amount;
                    if (result[i].trans_type == 'D')
                        total_debit += result[i].amount;
                }
                res.send({'result':result, 'total_credit':total_credit, 'total_debit':total_debit});
            });
        });
    };

    this.getBalanceByCompanyId = function (companyId, month, res) {
        connection.acquire(function (err, con) {
            var sql = "SELECT B.* FROM `cfs_operation` A left join (SELECT operation_id as operationId, SUM(COALESCE(CASE WHEN trans_type = 'D' THEN amount END,0)) total_debits, SUM(COALESCE(CASE WHEN trans_type = 'C' THEN amount END,0)) total_credits from cfs_operation_trans ";
            if (month > 0) {
                sql += "where MONTH(date_created)=" + month;
            }
            sql += " group by operationId) B on A.id=B.operationId where A.status='A' "; 
            if (companyId > 0) {
                sql += "and A.company_id=" + companyId;
            }
            var query = con.query(sql, function (err, result) {
                con.release();
                var total_credit = 0, total_debit = 0;
                for (var i = 0; i < result.length; i++) {
                    total_credit += result[i].total_credits;
                    total_debit += result[i].total_debits;
                }
                res.send({'total_credit':total_credit, 'total_debit':total_debit});
            });
        });
    };
    /* Transaction End */

    /* Delete */
    this.deleteOperationTransactionList = function (id, res) {
        connection.acquire(function (err, con) {
            con.query('delete from cfs_operation_trans where transaction_id = ?', [id], function (err, result) {
                con.release();
                if (err) {
                    res.send({ status: 1, message: 'Failed to delete' });
                } else {
                    res.send({ status: 0, message: 'Deleted successfully' });
                }
            });
        });
    };
    /* Delete */

    
}

module.exports = new myModel();

