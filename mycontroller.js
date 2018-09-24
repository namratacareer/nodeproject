var app = angular.module('myApp', ['ngCookies', 'ngRoute']);

app.run(function ($rootScope, $location, $cookies) {
    // keep user logged in after page refresh
    $rootScope.userId = $cookies.get('userId') || {};
    if ($rootScope.userId > 0) {
        $rootScope.userName = $cookies.get('userName');
        $rootScope.company_id = $cookies.get('company_id');
    } 
});

// Optional configuration for graph
app.config(['ChartJsProvider', function (ChartJsProvider) {
    // Configure all charts
    ChartJsProvider.setOptions({
        colours: ['#FF5252', '#FF8A80'],
        responsive: false
    });
    // Configure all line charts
    ChartJsProvider.setOptions('Line', {
        datasetFill: false
    });
}]);

app.controller('MyController', function ($http, $scope, $location, $cookies, $rootScope) {
    if ($rootScope.userId > 0) {								
        window.location.href = "/home";
    }
    $scope.checklogin = function () {
        var data = {
                'username': $scope.username,
                'password': $scope.password
        };
        $http.post("loginvalidate",data).success(function (response) {
            $scope.results = response;
            //console.log($scope.results.status);
            if ($scope.results.status == true && $scope.results.userid > 0) {
                // Setting a cookie
                $cookies.put('userId', $scope.results.userid);
                $cookies.put('userName', $scope.results.username);
                $cookies.put('company_id', $scope.results.company_id);                
                window.location.href = "home";
            }
        });
    };
});

app.controller('HomeController', function ($http, DataService, $scope, $location, $cookies, $rootScope, $timeout, $window) {
    if ($rootScope.userId == 0) {
        window.location.href = "/";
    } 
    var company_id = $rootScope.company_id
    $scope.logout = function () {
        $cookies.put('userId', 0);
        $cookies.put('userName', '');
        $cookies.put('company_id', '');
        window.location.href = "/";
    };
    $scope.operationlist = [];
    $scope.isLoading = true;
    //Update Opening Balance..
    $timeout(function () {
        $http.get("updateopeningbalance/cfs_operation/cfs_operation_trans/id/operation_id").success(function (response) {
            console.log("Operation " + response);
        });
        $http.get("updateopeningbalance/cfs_capex_acc/cfs_capex_trans/capex_id/capex_id").success(function (response) {
            console.log("Capex " + response);
        });
        $http.get("updateopeningbalance/cfs_refundable_acc/cfs_refundable_trans/refundable_id/refundable_id").success(function (response) {
            console.log("Deposit " + response);
        });
        $http.get("updateopeningbalance/cfs_prodry_acc/cfs_prodry_trans/prodry_id/prodry_id").success(function (response) {
            console.log("Dry Cam " + response);
        });
        $http.get("updateopeningbalance/cfs_provision_acc/cfs_provision_trans/provision_id/provision_id").success(function (response) {
            console.log("provision " + response);
        });
        $http.get("updateopeningbalance/cfs_reimbursement/cfs_reim_trans/reimbursment_id/reimburstment_id").success(function (response) {
            console.log("reimburstment " + response);
        });
    }, 1000);
    //end
    $timeout(function() {
        $http.get("getoperationcompanyList/" + company_id + "/0").success(function (response) {
        $scope.r = response;
        for (var i = 0; i < $scope.r.length; i++) {
            var cc = DataService.createNew('getoperationdetailsList/', $scope.r[i].id, 0);
            $scope.operationlist[i] = { 'id': $scope.r[i].id, 'name': $scope.r[i].name, 'details': cc, 'code': $scope.r[i].code };
            //alert(JSON.stringify($scope.operationlist[i]));
        }
        $scope.isLoading = false;
        });
    }, 1000);
    $scope.getTotal = function (fieldname, arr) {
        var total = 0, c;
        angular.forEach(arr.details, function (element) {
            c = element;
            if (fieldname == 'OP')
                total += c.op_balance;
            if (fieldname == 'C')
                total += c.total_credits;
            if (fieldname == 'D')
                total += c.total_debits;
            if (fieldname == 'TOT')
                total += c.op_balance + c.total_credits - c.total_debits;
        });
        if (!isNaN(total))
            // if(total%1 != 0) {           
            //     return total.toFixed(2);
            // }
            // else{
            //     return total;
            // }
            return total;
        else
            return 0;
    };
    $scope.reloadRoute = function () {
        $window.location.reload();
    }
});

app.controller('configController', function ($http, $scope, $location, $cookies, $rootScope, $window, DataService) {
    if ($rootScope.userId == 0) {
        window.location.href = "/";
    }
    var company_id = $rootScope.company_id
    $scope.showCompanyModal = false;
    $scope.showCapexModal = false;
    $scope.showDepositModal = false;
    $scope.showProvisionModal = false;
    $scope.showDrycamModal = false;
    $scope.showReimModal = false;
    $scope.showBankModal = false;
	$scope.showOpbalanceModal = false;
	$scope.showClientModal = false;

    $scope.companies = [];
    $scope.capex = [];
    $scope.reimbursement = [];
    $scope.deposits = [];
    $scope.provision = [];
    $scope.drycam = [];
    $scope.banks = [];
	$scope.opbalance = [];
	$scope.client = [];

    $http.get("companylist/" + company_id).success(function (response) {
        $scope.companies = response;
    });
	$http.get("branchlist").success(function (response) {
        $scope.allbranches = response;
    });
    $http.get("capexlist/" + company_id).success(function (response) {
        $scope.capex = response;
    });
	$http.get("clientlist").success(function (response) {
        $scope.client = response;
    });
    $http.get("reimbursementlist/" + company_id).success(function (response) {
        $scope.reimbursement = response;
    });
    $http.get("depositslist").success(function (response) {
        $scope.deposits = response;
    });
    $http.get("provisionlist/" + company_id).success(function (response) {
        //alert(JSON.stringify(response));
        $scope.provision = response;
    });
    $http.get("drycamlist/" + company_id).success(function (response) {
        $scope.drycam = response;
    });
    $http.get("getcompanylistforbank/" + company_id).success(function (response) {
        $scope.r = response;
        if ($scope.r.length > 0) {
            for (var i = 0; i < $scope.r.length; i++) {
                var cc = DataService.createNew('getbanklistwithcompany/', $scope.r[i].company_id, i);
                $scope.banks[i] = { 'company_id': $scope.r[i].company_id, 'name': $scope.r[i].name, 'code': $scope.r[i].code, 'details': cc };
            }
        }
    });		
	$http.get("getoperationcompanyList/" + company_id + "/0").success(function (response) {
        $scope.r = response; 
        for (var i = 0; i < $scope.r.length; i++) {
            var cc = DataService.createNew('getoperationdetailsList/', $scope.r[i].id, 0);
            $scope.opbalance[i] = { 'id': $scope.r[i].id, 'name': $scope.r[i].name, 'details': cc };
        }
    });

    angular.element('.alldivs').hide();
    $scope.showdiv = function (name) {
        angular.element('.alldivs').hide();
        angular.element('#' + name).show();
    };
    $scope.showAddModal = function (divname) {
        $scope.btnName = 'ADD';
        $scope.actionId = 0;
        if (divname == "company") {
            $scope.showCompanyModal = true;
        }
        if (divname == "capex") {
            $scope.showCapexModal = true;
        }
		if (divname == "client") {
            $scope.showClientModal = true;
        }
        if (divname == "deposit") {
            $scope.showDepositModal = true;
        }
        if (divname == "provision") {
            $scope.showProvisionModal = true;
        }
        if (divname == "drycam") {
            $scope.showDrycamModal = true;
        }
        if (divname == "reimbursement") {
            $scope.showReimModal = true;
        }
        if (divname == "bank") {
            $scope.showBankModal = true;
        }
		if (divname == "opbalance") {
            $scope.showOpbalanceModal = true;
        }
    };
    $scope.showEditModal = function (arr, divname) {
       // console.log(arr);
        $scope.btnName = 'UPDATE';
        if (divname == "company") {
            $scope.showCompanyModal = true;
            $scope.actionId = arr.id;
            $scope.name = arr.name;
            $scope.code = arr.code;            
        }
        if (divname == "capex") {
            $scope.showCapexModal = true;
            $scope.actionId = arr.capex_id;
            $scope.capex_acc_name = arr.acc_name;
        }
		if (divname == "client") {
            $scope.showClientModal = true;
            $scope.actionId = arr.id;
            $scope.client_name = arr.name;
        }
        if (divname == "deposit") {
            $scope.showDepositModal = true;
            $scope.actionId = arr.refundable_id;
            $scope.deposit_acc_name = arr.acc_name;
        }
        if (divname == "provision") {
            $scope.showProvisionModal = true;
            $scope.actionId = arr.provision_id;
            $scope.provision_acc_name = arr.acc_name;
        }
        if (divname == "drycam") {
            $scope.showDrycamModal = true;
            $scope.actionId = arr.prodry_id;
            $scope.drycam_acc_name = arr.acc_name;
        }
        if (divname == "reimbursement") {
            $scope.showReimModal = true;
            $scope.actionId = arr.reimbursment_id;
            $scope.reim_acc_name = arr.acc_name;
            $scope.company_id = arr.company_id;
        }
        if (divname == "bank") {
            $scope.showBankModal = true;
            $scope.actionId = arr.id;
            $scope.bank_name = arr.bname;
            $scope.bank_code = arr.bcode;
            $scope.bank_company_id = arr.company_id;
			$scope.branch_id = arr.branch_id;
        }
		if (divname == "opbalance") {
			$scope.banklist =[];
			$scope.banklist[0] = {'id':arr.bankacc_id, 'bname' : arr.bname};
			//console.log($scope.banklist);
            $scope.showOpbalanceModal = true;
            $scope.actionId = arr.id;
            $scope.selBank = arr.bankacc_id;
            $scope.op_balance = arr.op_balance;
            $scope.bank_company_id1 = arr.company_id;
			$scope.branch_id1 = arr.branch_id;
        }
        
    };

    $scope.doDelete = function (arr, divname) {
        var deleteUser = $window.confirm('Are you absolutely sure you want to delete?');
        if (deleteUser) {
            var data = {
                'status': 'D'
            };
            if (divname == "company") {
                $http.get("checkidexistornot/cfs_bankaccounts/company_id/"+arr.id).success(function (response) {
                    $scope.res = response.length;
                    if ($scope.res > 0) {
                        $window.alert('Sorry, the company is associated with bank, you could not be deleted.');
                    } else {
                        $http.get("checkidexistornot/cfs_reimbursement/company_id/" + arr.id).success(function (response) {
                            if (response.length > 0) {
                                $window.alert('Sorry, the company is associated with reimbursement, you could not be deleted.');
                            } else {
                                $http.post("updateCompanyList/" + arr.id, data).success(function (response) {
                                    window.location.href = "/configuration";
                                });
                            }
                        });
                    }
                });
            }
            if (divname == "capex") {
                $http.get("checkidexistornot/cfs_capex_trans/capex_id/" + arr.capex_id).success(function (response) {
                    if (response.length > 0) {
                        $window.alert('Sorry, already transaction has been done under this account, you could not be deleted.');
                    } else {
                        $http.post("updateCapexList/" + arr.capex_id, data).success(function (response) {
                            window.location.href = "/configuration";
                        });
                    }
                });
            }
			if (divname == "client") {
                $http.get("checkidexistornot/cfs_operation_trans/beneficiary_id/" + arr.id).success(function (response) {
                    if (response.length > 0) {
                        $window.alert('Sorry, already transaction has been done under the client, you could not be deleted.');
                    } else {
                        $http.post("updateClientList/" + arr.id, data).success(function (response) {
                            window.location.href = "/configuration";
                        });
                    }
                });
            }
            if (divname == "deposit") {
                $http.get("checkidexistornot/cfs_refundable_trans/refundable_id/" + arr.refundable_id).success(function (response) {
                    if (response.length > 0) {
                        $window.alert('Sorry, already transaction has been done under this account, you could not be deleted.');
                    } else {
                        $http.post("updateDepositList/" + arr.refundable_id, data).success(function (response) {
                            window.location.href = "/configuration";
                        });
                    }
                });
            }
            if (divname == "provision") {
                $http.get("checkidexistornot/cfs_provision_trans/provision_id/" + arr.provision_id).success(function (response) {
                    if (response.length > 0) {
                        $window.alert('Sorry, already transaction has been done under this account, you could not be deleted.');
                    } else {
                        $http.post("updateProvisionList/" + arr.provision_id, data).success(function (response) {
                            window.location.href = "/configuration";
                        });
                    }
                });
            }
            if (divname == "drycam") {
                $http.get("checkidexistornot/cfs_prodry_trans/prodry_id/" + arr.prodry_id).success(function (response) {
                    if (response.length > 0) {
                        $window.alert('Sorry, already transaction has been done under this account, you could not be deleted.');
                    } else {
                        $http.post("updateDrycamList/" + arr.prodry_id, data).success(function (response) {
                            window.location.href = "/configuration";
                        });
                    }
                });
            }
            if (divname == "reimbursement") {
                $http.get("checkidexistornot/cfs_reim_trans/reimburstment_id/" + arr.reimbursment_id).success(function (response) {
                    if (response.length > 0) {
                        $window.alert('Sorry, already transaction has been done under this account, you could not be deleted.');
                    } else {
                        $http.post("updateReimList/" + arr.reimbursment_id, data).success(function (response) {
                            window.location.href = "/configuration";
                        });
                    }
                });
            }
        }
    };

    $scope.addEditCompany = function (id) {
        var err = 1;
        if (angular.element("#name").val() == '') {
            angular.element("#nameErr").text("Enter Company Name");
            err = 0;
        }
        if (angular.element("#code").val() == '') {
            angular.element("#codeErr").text("Enter Company Code");
            err = 0;
        }
        if (err == 1) {
            var data = {
                'name': angular.element("#name").val(),
                'code': angular.element("#code").val()
            };
            if (id==0) {
                $http.post("addcompanymaster", data).success(function (response) {
                    window.location.href = "/configuration";
                });
            }
            if (id > 0) {
                $http.post("updateCompanyList/" + id, data).success(function (response) {
                    window.location.href = "/configuration";
                });
            }
        }
    };

    $scope.addEditCapex = function (id) {
        var err = 1;
        if (angular.element("#capex_acc_name").val() == '') {
            angular.element("#capexErr").text("Enter Account Name");
            err = 0;
        }
        if (err == 1) {
            var data = {
                'acc_name': angular.element("#capex_acc_name").val(),
                'company_id': company_id
            };
            if (id == 0) {
                $http.post("addcapexmaster", data).success(function (response) {
                    window.location.href = "/configuration";
                });
            }
            if (id > 0) {
                $http.post("updateCapexList/" + id, data).success(function (response) {
                    window.location.href = "/configuration";
                });
            }
        }
    };
	$scope.addEditClient = function (id) {
        var err = 1;
        if (angular.element("#client_name").val() == '') {
            angular.element("#clientnameErr").text("Enter Client Name");
            err = 0;
        }
        if (err == 1) {
            var data = {
                'name': angular.element("#client_name").val()
            };
            if (id == 0) {
                $http.post("addclientmaster", data).success(function (response) {
                    window.location.href = "/configuration";
                });
            }
            if (id > 0) {
                $http.post("updateClientList/" + id, data).success(function (response) {
                    window.location.href = "/configuration";
                });
            }
        }
    };

    $scope.addEditReimbursement = function (id) {
        var err = 1;
        if (angular.element("#company_id").val() == '') {
            angular.element("#reimCompanyErr").text("Select Company Name");
            err = 0;
        }
        if (angular.element("#reim_acc_name").val() == '') {
            angular.element("#reimErr").text("Enter Account Name");
            err = 0;
        }
        if (err == 1) {
            var data = {
                'company_id': angular.element("#company_id").val(),
                'acc_name': angular.element("#reim_acc_name").val()
            };
            if (id == 0) {
                $http.post("addreimbursementmaster", data).success(function (response) {
                    window.location.href = "/configuration";
                });
            }
            if (id > 0) {
                $http.post("updateReimList/" + id, data).success(function (response) {
                    window.location.href = "/configuration";
                });
            }
        }
    };

    $scope.addEditDeposit = function (id) {
        var err = 1;
        if (angular.element("#deposit_acc_name").val() == '') {
            angular.element("#depositErr").text("Enter Account Name");
            err = 0;
        }
        if (err == 1) {
            var data = {
                'acc_name': angular.element("#deposit_acc_name").val()
            };
            if (id == 0) {
                $http.post("adddepositsmaster", data).success(function (response) {
                    window.location.href = "/configuration";
                });
            }
            if (id > 0) {
                $http.post("updateDepositList/" + id, data).success(function (response) {
                    window.location.href = "/configuration";
                });
            }
        }
    };

    $scope.addEditProvision = function (id) {
        //alert(id)
        var err = 1;
        if (angular.element("#provision_acc_name").val() == '') {
            angular.element("#provisionErr").text("Enter Account Name");
            err = 0;
        }
        if (err == 1) {
            var data = {
                'acc_name': angular.element("#provision_acc_name").val(),
                'company_id': company_id
            };
            if (id == 0) {
                $http.post("addprovisionmaster", data).success(function (response) {
                    window.location.href = "/configuration";
                });
            }
            if (id > 0) {
                $http.post("updateProvisionList/" + id, data).success(function (response) {
                    window.location.href = "/configuration";
                });
            }
        }
    };

    $scope.addEditDrycam = function (id) {
        var err = 1;
        if (angular.element("#drycam_acc_name").val() == '') {
            angular.element("#drycamErr").text("Enter Account Name");
            err = 0;
        }
        if (err == 1) {
            var data = {
                'acc_name': angular.element("#drycam_acc_name").val(),
                'company_id': company_id
            };
            if (id == 0) {
                $http.post("adddrycammaster", data).success(function (response) {
                    window.location.href = "/configuration";
                });
            }
            if (id > 0) {
                $http.post("updateDrycamList/" + id, data).success(function (response) {
                    window.location.href = "/configuration";
                });
            }
        }
    };

    $scope.addEditBank = function (id) {
        var err = 1;
        if (angular.element("#bank_company_id").val() == '') {
            angular.element("#bankcompanyErr").text("Select Company Name");
            err = 0;
        }
        if (angular.element("#bank_name").val() == '') {
            angular.element("#banknameErr").text("Enter Bank Name");
            err = 0;
        }
        if (angular.element("#bank_code").val() == '') {
            angular.element("#bankcodeErr").text("Enter Bank Code");
            err = 0;
        }
		if (angular.element("#branch_id").val() == '') {
            angular.element("#bankbranchErr").text("Select Branch Name");
            err = 0;
        }
        if (err == 1) {
            var companyId = angular.element("#bank_company_id").val();
            var data = {
                'company_id': angular.element("#bank_company_id").val(),
                'bname': angular.element("#bank_name").val(),
                'bcode': angular.element("#bank_code").val(),
				'branch_id': angular.element("#branch_id").val()
            };
            if (id == 0) {
                $http.post("addbankmaster/" + companyId, data).success(function (response) {
                    window.location.href = "/configuration";
                });
            }
            if (id > 0) {
                $http.post("updateBankList/" + id, data).success(function (response) {
                    window.location.href = "/configuration";
                });
            }
        }
    };
	
	$scope.addEditOpbalance = function (id) {
        var err = 1;
        if (angular.element("#bank_company_id1").val() == '') {
            angular.element("#bankcompanyErr1").text("Select Company Name");
            err = 0;
        }
        if (angular.element("#selBank").val() == '') {
            angular.element("#selBankErr").text("Select Bank Name");
            err = 0;
        }
		if (angular.element("#branch_id1").val() == '') {
            angular.element("#bankbranchErr1").text("Select Branch Name");
            err = 0;
        }
        if (angular.element("#op_balance").val() == '') {
            angular.element("#opbalanceErr").text("Enter Opening Balance");
            err = 0;
        }
        if (err == 1) {
            var companyId = angular.element("#bank_company_id1").val();
			var bid = (angular.element("#selBank").val()).split(":");
            var data = {
                'company_id': angular.element("#bank_company_id1").val(),
                'bankacc_id': bid[1],
                'op_balance': angular.element("#op_balance").val(),
				'branch_id': angular.element("#branch_id1").val()
            };
            if (id > 0) {
                $http.post("updateOperationList/" + id, data).success(function (response) {
                    window.location.href = "/configuration";
                });
            }
        }
    };

});

app.controller('capexController', function ($http, $scope, $location, $cookies, $rootScope) {
    if ($rootScope.userId == 0) {
        window.location.href = "/";
    }
    var company_id = $rootScope.company_id;
    $scope.capexlist = [];
    $scope.mydiv = true;
    $scope.showModal = false;
    $http.get("getBenificiaryList").success(function (response) {
        $scope.benlist = response;
    });
    $http.get("accountList/" +company_id).success(function (response) {
        $scope.accountlist = response;
    });
    $http.get("getcapexlist/0/" +company_id).success(function (response) {
        $scope.capexlist = response;
    });
    $scope.getAllList = function (id) {
        var accountId = id;
        $http.get("getcapexlist/" + accountId + "/" +company_id).success(function (response) {
            $scope.capexlist = response;
        });
    };
    $scope.getTotal = function (fieldname) {
        var total = 0;
        for (var i = 0; i < $scope.capexlist.length; i++) {
            var c = $scope.capexlist[i];
            if (fieldname == 'OP')
                total += c.op_balance;
            if (fieldname == 'C')
                total += c.total_credits;
            if (fieldname == 'D')
                total += c.total_debits;
            if (fieldname == 'TOT')
                total += c.op_balance + c.total_credits - c.total_debits;
        }
        return total;
    };
    $scope.openpopup = function (capex_id) {
        $scope.showModal = true;
        $http.get("getcapexlist/" + capex_id + "/" +company_id).success(function (response) {
            $scope.editablelists = response;
            $scope.selEditAccount = $scope.editablelists[0].acc_name;
        });
    };
    $scope.addCapexTransactionData = function (capex_id) {
        var err = 1;
        if (angular.element("#selTranType").val() == '') {
            angular.element("#selTranTypeErr").text("Please select one  type");
            err = 0;
        }
        if (angular.element("#selBenId").val() == '') {
            angular.element("#selBenIdErr").text("Please select one name");
            err = 0;
        }
        if (angular.element("#selAmount").val() == '') {
            angular.element("#selAmountErr").text("Enter some amount");
            err = 0;
        } 
        else {
            if (angular.element("#selTranType").val() == 'D' && parseInt(angular.element("#selAmount").val()) > parseInt(angular.element("#selCurrBal").val())) {
                angular.element("#selAmountSmallerErr").text("Amount can not be greater than current balance");
                err = 0;
            }
        }
        if (err == 1) {
            angular.element("#selAmountSmallerErr").text("");
            var data = {
                'capex_id': capex_id,
                'beneficiary_id' : angular.element("#selBenId").val(),
                'trans_type': angular.element("#selTranType").val(),
                'amount': angular.element("#selAmount").val(),
                'remark': angular.element("#remark").val()
            };
            $http.post("addcapextransactiondata/", data).success(function (response) {
                window.location.href = "/capex";
            });
        }
    };
    //Credit Debit List
    $scope.showmydiv = function (id, type) {
        $scope.mydiv = false;
        if (type == 'ALL' || type == 'C') {
            $http.get("getCapexCreditList/" + id).success(function (response) {
                $scope.creditlist = response;
            });
            angular.element("#displayOperation1").show();
            if (type == 'C') angular.element("#displayOperation2").hide();
        }
        if (type == 'ALL' || type == 'D') {
            $http.get("getCapexDebitList/" + id).success(function (response) {
                $scope.debitlist = response;
            });
            angular.element("#displayOperation1").show();
            if (type == 'D') angular.element("#displayOperation1").hide();
        }
    };

    $scope.getTotalAmount = function (arr) {
        var sum = 0;
        if (arr.length > 0) {
            for (var i = 0; i < arr.length; i++) {
                sum = sum + arr[i].amount;
            }
        }
        return sum;
    }

    $scope.goBack = function () {
        $scope.mydiv = true;
    };
});

app.controller('depositController', function ($http, $scope, $location, $cookies, $rootScope) {
    if ($rootScope.userId == 0) {
        window.location.href = "/";
    }
    $scope.depositlist = [];
    $scope.mydiv = true;
    $scope.showModal = false;
    $http.get("depositaccountList").success(function (response) {
        $scope.accountlist = response;
    });
    $http.get("getBenificiaryList").success(function (response) {
        $scope.benlist = response;
    });
    $http.get("getdepositlist/0").success(function (response) {
        $scope.depositlist = response;
    });
    $scope.getAllList = function (id) {
        var accountId = id;
        $http.get("getdepositlist/" + accountId).success(function (response) {
            $scope.depositlist = response;
        });
    };
    $scope.getTotal = function (fieldname) {
        var total = 0;
        for (var i = 0; i < $scope.depositlist.length; i++) {
            var c = $scope.depositlist[i];
            if (fieldname == 'OP')
                total += c.op_balance;
            if (fieldname == 'C')
                total += c.total_credits;
            if (fieldname == 'D')
                total += c.total_debits;
            if (fieldname == 'TOT')
                total += c.op_balance + c.total_credits - c.total_debits;
        }
        return total;
    };
    $scope.openpopup = function (capex_id) {
        $scope.showModal = true;
        $http.get("getdepositlist/" + capex_id).success(function (response) {
            $scope.editablelists = response;
            $scope.selEditAccount = $scope.editablelists[0].acc_name;
        });
    };
    $scope.addDepositTransactionData = function (refundable_id) {
        var err = 1;
        if (angular.element("#selTranType").val() == '') {
            angular.element("#selTranTypeErr").text("Please select one  type");
            err = 0;
        }
        if (angular.element("#selBenId").val() == '') {
            angular.element("#selBenIdErr").text("Please select one name");
            err = 0;
        }
        if (angular.element("#selAmount").val() == '') {
            angular.element("#selAmountErr").text("Enter some amount");
            err = 0;
        } 
        else {
            if (angular.element("#selTranType").val() == 'D' && parseInt(angular.element("#selAmount").val()) > parseInt(angular.element("#selCurrBal").val())) {
                angular.element("#selAmountSmallerErr").text("Amount can not be greater than current balance");
                err = 0;
            }
        }
        if (err == 1) {
            angular.element("#selAmountSmallerErr").text("");
            var data = {
                'refundable_id': refundable_id,
                'beneficiary_id' : angular.element("#selBenId").val(),
                'trans_type': angular.element("#selTranType").val(),
                'amount': angular.element("#selAmount").val(),
                'remark': angular.element("#remark").val()
            };
            $http.post("adddeposittransactiondata/", data).success(function (response) {
                window.location.href = "/deposits";
            });
        }
    };
    //Credit Debit List
    $scope.showmydiv = function (id, type) {
        $scope.mydiv = false;
        if (type == 'ALL' || type == 'C') {
            $http.get("getDepositCreditList/" + id).success(function (response) {
                $scope.creditlist = response;
            });
            angular.element("#displayOperation1").show();
            if (type == 'C') angular.element("#displayOperation2").hide();
        }
        if (type == 'ALL' || type == 'D') {
            $http.get("getDepositDebitList/" + id).success(function (response) {
                $scope.debitlist = response;
            });
            angular.element("#displayOperation1").show();
            if (type == 'D') angular.element("#displayOperation1").hide();
        }
    };

    $scope.getTotalAmount = function (arr) {
        var sum = 0;
        if (arr.length > 0) {
            for (var i = 0; i < arr.length; i++) {
                sum = sum + arr[i].amount;
            }
        }
        return sum;
    }

    $scope.goBack = function () {
        $scope.mydiv = true;
    };
});

app.controller('drycamController', function ($http, $scope, $location, $cookies, $rootScope) {
    if ($rootScope.userId == 0) {
        window.location.href = "/";
    }
    var company_id = $rootScope.company_id;
    $scope.drycamlist = [];
    $scope.mydiv = true;
    $scope.showModal = false;
    $http.get("drycamaccountList").success(function (response) {
        $scope.accountlist = response;
    });
    $http.get("getBenificiaryList").success(function (response) {
        $scope.benlist = response;
    });
    $http.get("getdrycamlist/0").success(function (response) {
        $scope.drycamlist = response;
    });
    $scope.getAllList = function (pid) {
        var id = pid;
        $http.get("getdrycamlist/" + id).success(function (response) {
            $scope.drycamlist = response;
        });
    };
    $scope.getTotal = function (fieldname) {
        var total = 0;
        for (var i = 0; i < $scope.drycamlist.length; i++) {
            var c = $scope.drycamlist[i];
            if (fieldname == 'OP')
                total += c.op_balance;
            if (fieldname == 'C')
                total += c.total_credits;
            if (fieldname == 'D')
                total += c.total_debits;
            if (fieldname == 'TOT')
                total += c.op_balance + c.total_credits - c.total_debits;
        }
        return total;
    };
    $scope.openpopup = function (id) {
        $scope.showModal = true;
        $http.get("getdrycamlist/" + id).success(function (response) {
            $scope.editablelists = response;
            $scope.selEditAccount = $scope.editablelists[0].acc_name;
        });
    };
    $scope.addDrycamTransactionData = function (prodry_id) {
        var err = 1;
        if (angular.element("#selTranType").val() == '') {
            angular.element("#selTranTypeErr").text("Please select one  type");
            err = 0;
        }
        if (angular.element("#selBenId").val() == '') {
            angular.element("#selBenIdErr").text("Please select one name");
            err = 0;
        }
        if (angular.element("#selAmount").val() == '') {
            angular.element("#selAmountErr").text("Enter some amount");
            err = 0;
        } 
        else {
            if (angular.element("#selTranType").val() == 'D' && parseInt(angular.element("#selAmount").val()) > parseInt(angular.element("#selCurrBal").val())) {
                angular.element("#selAmountSmallerErr").text("Amount can not be greater than current balance");
                err = 0;
            }
        }
        if (err == 1) {
            angular.element("#selAmountSmallerErr").text("");
            var data = {
                'prodry_id': prodry_id,
                'beneficiary_id': angular.element("#selBenId").val(),
                'trans_type': angular.element("#selTranType").val(),
                'amount': angular.element("#selAmount").val(),
                'remark': angular.element("#remark").val()
            };
            $http.post("adddrycamtransactiondata/", data).success(function (response) {
                window.location.href = "/drycam";
            });
        }
    };
    //Credit Debit List
    $scope.showmydiv = function (id, type) {
        $scope.mydiv = false;
        if (type == 'ALL' || type == 'C') {
            $http.get("getDrycamCreditList/" + id).success(function (response) {
                $scope.creditlist = response;
            });
            angular.element("#displayOperation1").show();
            if (type == 'C') angular.element("#displayOperation2").hide();
        }
        if (type == 'ALL' || type == 'D') {
            $http.get("getDrycamDebitList/" + id).success(function (response) {
                $scope.debitlist = response;
            });
            angular.element("#displayOperation1").show();
            if (type == 'D') angular.element("#displayOperation1").hide();
        }
    };

    $scope.getTotalAmount = function (arr) {
        var sum = 0;
        if (arr.length > 0) {
            for (var i = 0; i < arr.length; i++) {
                sum = sum + arr[i].amount;
            }
        }
        return sum;
    }

    $scope.goBack = function () {
        $scope.mydiv = true;
    };
});

app.controller('provisionController', function ($http, $scope, $location, $cookies, $rootScope) {
    if ($rootScope.userId == 0) {
        window.location.href = "/";
    }
    var cookie_company_id = $rootScope.company_id
    $scope.provisioncreditlist = [];
	$scope.provisiondebitlist = [];
    $scope.mydiv = true;
    $scope.showModal = false;
    $scope.company_id = cookie_company_id;
	
    $http.get("provisionaccountList/" + cookie_company_id).success(function (response) {
        $scope.accountlist = response;
    });
    $http.get("getBenificiaryList").success(function (response) {
        $scope.benlist = response;
    });
    $scope.branchlist = [];
    $http.get("branchlist").success(function (response) {
        $scope.branchlist = response;
    });
    /*$http.get("getprovisionlist/0").success(function (response) {
        $scope.provisionlist = response;
    });$scope.getAllList = function (id) {
        var accountId = id;
        $http.get("getprovisionlist/" + accountId).success(function (response) {
            $scope.provisionlist = response;
        });
    };*/
	//added
	$http.get("getProvisionTransactionList/C/" + cookie_company_id).success(function (response) {
        $scope.provisioncreditlist = response;

    });
	$http.get("getProvisionTransactionList/D/" + cookie_company_id).success(function (response) {
        $scope.provisiondebitlist = response;
    });
	$http.get("getProvisionTransactionList/0/" + cookie_company_id).success(function (response) {
        $scope.provisionlist = response;
    });
	//end
    $scope.getTotal = function (fieldname) {
        
        var total = 0;
		if(fieldname=='C'){
			for (var i = 0; i < $scope.provisioncreditlist.length; i++) {
					total += $scope.provisioncreditlist[i].amount;  
			}
		}

		if(fieldname=='D'){
			for (var i = 0; i < $scope.provisiondebitlist.length; i++) {
					total += $scope.provisiondebitlist[i].amount;  
			}
       // alert(total)
		}
        return total;
    };
    $scope.openpopup = function (id) {
        $scope.showModal = true;
       /* $http.get("getprovisionlist/" + id).success(function (response) {
            $scope.editablelists = response;
            $scope.selEditAccount = $scope.editablelists[0].acc_name;
        });*/
    };
    /**************Added on 26-10-2017*************/
    $scope.showhiddendiv = function(c){
        if(c=='T'){
            angular.element("#debitcreditDivId").hide();
            angular.element("#transferDivId").show(); 
            angular.element("#branchDivId").show();    
            angular.element("#bankDivId").show(); 
            angular.element("#accountDivId").hide();           
        }else{
            angular.element("#debitcreditDivId").show();
            angular.element("#transferDivId").hide();
            angular.element("#branchDivId").hide();
            angular.element("#bankDivId").hide();
            angular.element("#accountDivId").show();            
            
        }
    };
    $scope.showparticulardiv = function(c){
        if(c>0)
            angular.element("#particularDivId").show();
        else
            angular.element("#particularDivId").hide();
        $scope.particularslist=[];
       // console.log(c);
        if(c==1){
            $http.get("provisionlist/" + cookie_company_id).success(function (response) {
                //$scope.particularslist = response;
                //console.log(response);
                for(var i=0;i<response.length;i++){
                        $scope.particularslist[i]={'id':response[i].provision_id, 'acc_name':response[i].acc_name};
                }
                //console.log($scope.particularslist);
                angular.element("#particularDivId").show();
            });         
        }
        else if(c==2){
            $http.get("drycamlist/" + cookie_company_id).success(function (response) {
                //$scope.particularslist = response;
                for(var i=0;i<response.length;i++){
                        $scope.particularslist[i]={'id':response[i].prodry_id, 'acc_name':response[i].acc_name};
                }
                angular.element("#particularDivId").show();
            });
        }
        else if(c==3){
            var cid=angular.element("#selCompanyId").val();
            $http.get("reimbursementlistbycompanyid/"+cookie_company_id).success(function (response) {
                //$scope.particularslist = response;
                for(var i=0;i<response.length;i++){
                        $scope.particularslist[i]={'id':response[i].reimbursment_id, 'acc_name':response[i].acc_name};
                }
                angular.element("#particularDivId").show();
            });
        }
    };
    $scope.showotherdiv = function(cc){ 
        if(cc==0){
            angular.element("#otherdiv").show();
        }else{
            angular.element("#otherdiv").hide();
        }
    };
    $scope.addProvisionTransactionData = function () {
        var err = 1;
        var type = angular.element("#selTranType").val();
        if (angular.element("#selTranType").val() == '') {
            angular.element("#selTranTypeErr").text("Please select one  type");
            err = 0;
        }
        if(type=='T'){ 
            if (angular.element("#seltransferaccount").val() == '') {
                angular.element("#seltransferaccountErr").text("Please select one account");
                err = 0;
            }
            if (angular.element("#selparticular").val() == '') {
                angular.element("#selparticularErr").text("Select a particular name");
                err = 0;
            }
            if (angular.element("#selparticular").val() == 0 && angular.element("#particulars").val() == '') {
                angular.element("#particularsErr").text("Please enter a name");
                err = 0;
            }
            if (angular.element("#selBranch").val() == 0 && angular.element("#selBranch").val() == ''){
                angular.element("#selBranchErr").text("Select a branch");
                err = 0;
            }
            if (angular.element("#selbank").val() == '') {
                angular.element("#selbankErr").text("Select a bank name");
                err = 0;
            }
        }else{
            if (angular.element("#selBenId").val() == '') {
                angular.element("#selBenIdErr").text("Please select one name");
                err = 0;
            }
            if (angular.element("#selEditAccount").val() == '') {
                angular.element("#selEditAccountErr").text("Please select one account");
                err = 0;
            }
            
        }
        
		
  //       if (angular.element("#selBenId").val() == '') {
  //           angular.element("#selBenIdErr").text("Please select one name");
  //           err = 0;
  //       }
        if (angular.element("#selAmount").val() == '') {
            angular.element("#selAmountErr").text("Enter some amount");
            err = 0;
        } 
        

        else {
            if (angular.element("#selTranType").val() == 'D' && parseInt(angular.element("#selAmount").val()) > parseInt(angular.element("#selCurrBal").val())) {
                angular.element("#selAmountSmallerErr").text("Amount can not be greater than current balance");
                err = 0;
            }
        }
        if (err == 1) {
            angular.element("#selAmountSmallerErr").text("");
            if(type=='T'){
                var bank_id = angular.element("#selbank").val();
                var branch_id = angular.element("#selBranch").val();

                if(angular.element("#seltransferaccount").val()==1){
                    var table1= 'cfs_provision_acc';
                    var table2= 'cfs_provision_trans';  
                    var field1= 'provision_id';
                }
                if(angular.element("#seltransferaccount").val()==2){
                    var table1= 'cfs_prodry_acc';
                    var table2= 'cfs_prodry_trans'; 
                    var field1= 'prodry_id';
                }
                if(angular.element("#seltransferaccount").val()==3){
                    var table1= 'cfs_reimbursement';
                    var table2= 'cfs_reim_trans';   
                    var field1= 'reimburstment_id';
                }
                if(angular.element("#selparticular").val()==0){
                    var particularsname =  angular.element("#particulars").val();
                    var particularsId = 0;  
                }else{
                    var particularsname =  '';
                    var particularsId = angular.element("#selparticular").val();
                }
                var operation_id = 0;
               
                $http.get("getoperationdetailsList/" + parseInt(cookie_company_id) + "/" + parseInt(bank_id)).success(function (response) {                   
                   operation_id = response[0].id;
                   //alert(operation_id)
                   var data = {
                    'operation_id': operation_id,
                    'company_id': cookie_company_id,
                    'trans_type': 'C',
                    'seltransferaccount': angular.element("#seltransferaccount").val(),
                    'particulars': particularsname,
                    'particularsId': particularsId,
                    'beneficiary_id':0,
                    'amount': angular.element("#selAmount").val(),
                    'remark': angular.element("#remark").val(),
                    'table1': table1,
                    'table2':table2,
                    'field1':field1
                    };
                    
                    $http.post("addprovisiontransactiondatawithtransfer/", data).success(function (response) {
                        window.location.href = "/provision";
                    });
                   
                });
                 
                
            }//if type is transfer
            else{
                var data = {
                    'provision_id': angular.element("#selEditAccount").val(),
                    'company_id': cookie_company_id,
                    'trans_type': angular.element("#selTranType").val(),
                    'amount': angular.element("#selAmount").val(),
                    'beneficiary_id': angular.element("#selBenId").val(),
                    'remark': angular.element("#remark").val()
                };
                $http.post("addprovisiontransactiondata/", data).success(function (response) {
                    window.location.href = "/provision";
                });
            }
        }
    };
    $scope.showbankdiv = function(c){
       
        if(c>0)
            angular.element("#bankDivId").show();
        else
            angular.element("#bankDivId").hide();
        $scope.banklist=[];
       // console.log(c);
        if(c>0){
            $http.get("getBanklistWithCompanyBranch/" + cookie_company_id + "/" + c).success(function (response) {
                //$scope.particularslist = response;
                //console.log(response);
                for(var i=0;i<response.length;i++){
                        $scope.banklist[i]={'id':response[i].id, 'bname':response[i].bname};
                }
               // console.log($scope.banklist);
                angular.element("#bankDivId").show();
            });         
        }
       
    };
    //Credit Debit List
    /*$scope.showmydiv = function (id, type) {
        $scope.mydiv = false;
        if (type == 'ALL' || type == 'C') {
            $http.get("getProvisionCreditList/" + id).success(function (response) {
                $scope.creditlist = response;
            });
            angular.element("#displayOperation1").show();
            if (type == 'C') angular.element("#displayOperation2").hide();
        }
        if (type == 'ALL' || type == 'D') {
            $http.get("getProvisionDebitList/" + id).success(function (response) {
                $scope.debitlist = response;
            });
            angular.element("#displayOperation1").show();
            if (type == 'D') angular.element("#displayOperation1").hide();
        }
    };

    $scope.getTotalAmount = function (arr) {
        var sum = 0;
        if (arr.length > 0) {
            for (var i = 0; i < arr.length; i++) {
                sum = sum + arr[i].amount;
            }
        }
        return sum;
    }

    $scope.goBack = function () {
        $scope.mydiv = true;
    };*/
});

app.controller('operationController', function ($http, DataService, $scope, $location, $cookies, $rootScope, $window) {
    //console.log($rootScope.userId);
    if ($rootScope.userId == 0) {
        window.location.href = "/";
    }
    var company_id = $rootScope.company_id;
    $scope.operationlist = [];
    $scope.companies = [];
    $scope.banklist = [];
    $scope.mydiv = true;
    $scope.showModal = false;
	$scope.showEditModal = false;
    $scope.cookie_company_id =company_id;
    $http.get("getBenificiaryList").success(function (response) {
        //console.log(response);
        $scope.benlist = response;
    });
    //alert(company_id);
    $http.get("getoperationcompanyList/" + company_id + "/0").success(function (response) {
        
        $scope.operationlist = [];
        $scope.banklist = [];
        $scope.r = response;
        $scope.companies = response;
       // alert(JSON.stringify($scope.companies));
        for (var i = 0; i < $scope.r.length; i++) {
            var cc = DataService.createNew('getoperationdetailsList/', $scope.r[i].id, 0);
            $scope.operationlist[i] = { 'id': $scope.r[i].id, 'name': $scope.r[i].name, 'code':$scope.r[i].code, 'details': cc };
        }
    });
   
	$scope.branchlist = [];
	$http.get("branchlist").success(function (response) {
		$scope.branchlist = response;
	});

    /*************added on 24-10-2017*****************/
    $scope.cookie_company = [];
    $http.get("getCookieCompanyDetails/" + company_id).success(function (response) {
        $scope.cookie_company = response;
        
    });
    //alert(JSON.stringify($scope.companies));
	/*************added on 24-10-2017*****************/
    $scope.getAllList = function (c1, c2) {
        
        var companyid = c1;
        var branchid = c2;
        if (companyid == '' || companyid == undefined) {
            companyid = 0;
        }
        if (branchid == '' || branchid == undefined) {
            branchid = 0;
        }
       //alert(companyid);
       //alert(branchid);
        $http.get("getOperationCompanyListByBranch/" + companyid + "/" + branchid).success(function (response) {
            $scope.operationlist = [];
            $scope.r = response;
            //alert(JSON.stringify($scope.r)); 
            for (var i = 0; i < $scope.r.length; i++) {
                //alert(branchid)
                var cc = DataService.createNew('getOperationDetailsListByBranchId/', $scope.r[i].id, branchid);
                $scope.operationlist[i] = { 'id': $scope.r[i].id, 'name': $scope.r[i].name, 'details': cc };
				
            }
        });
    };
    $scope.getTotal = function (fieldname, arr) {
        var total = 0, c;
        angular.forEach(arr.details, function (element) {
            c = element;
            if (fieldname == 'OP')
                total += c.op_balance;
            if (fieldname == 'C')
                total += c.total_credits;
            if (fieldname == 'D')
                total += c.total_debits;
            if (fieldname == 'TOT')
                total += c.op_balance + c.total_credits - c.total_debits;
        });
        if (!isNaN(total))            
            return total;
            
        else
            return 0;
    };
    $scope.openpopup = function (c, companyName) { 
        //alert(JSON.stringify(c));
        $scope.showModal = true;
        $scope.editablelists = c;
        $scope.selEditCompany = companyName;
        $scope.selEditBank = $scope.editablelists.bname;
		$scope.selCompanyId = $scope.editablelists.company_id;
    };
	$scope.showhiddendiv = function(c){
		if(c=='T'){
			angular.element("#debitcreditDivId").hide();
			angular.element("#transferDivId").show();	
		}else{
			angular.element("#debitcreditDivId").show();
			angular.element("#transferDivId").hide();
		}
	};
	$scope.showparticulardiv = function(c){
		if(c>0)
			angular.element("#particularDivId").show();
		else
			angular.element("#particularDivId").hide();
		$scope.particularslist=[];
		//console.log(c);
		if(c==1){
			$http.get("provisionlist/" + company_id).success(function (response) {
				//$scope.particularslist = response;
				//console.log(response);
				for(var i=0;i<response.length;i++){
						$scope.particularslist[i]={'id':response[i].provision_id, 'acc_name':response[i].acc_name};
				}
				angular.element("#particularDivId").show();
			});			
		}
		else if(c==2){
			$http.get("drycamlist/" + company_id).success(function (response) {
				//$scope.particularslist = response;
				for(var i=0;i<response.length;i++){
						$scope.particularslist[i]={'id':response[i].prodry_id, 'acc_name':response[i].acc_name};
				}
				angular.element("#particularDivId").show();
			});
		}
		else if(c==3){
			var cid=angular.element("#selCompanyId").val();
			$http.get("reimbursementlistbycompanyid/"+cid).success(function (response) {
				//$scope.particularslist = response;
				for(var i=0;i<response.length;i++){
						$scope.particularslist[i]={'id':response[i].reimbursment_id, 'acc_name':response[i].acc_name};
				}
				angular.element("#particularDivId").show();
			});
		}
	};
	$scope.showotherdiv = function(cc){ 
		if(cc==0){
			angular.element("#otherdiv").show();
		}else{
			angular.element("#otherdiv").hide();
		}
	};
	$scope.showEditDataModal = function(arr, prev_balance){
		//console.log(arr);
		$scope.showEditModal = true;
		$scope.company_name = arr.name;
		$scope.bank_name = arr.bname;
		$scope.ben_name = arr.beneficiary_id;
		$scope.tran_type = arr.trans_type;
		$scope.amount = arr.amount;
		$scope.remarks = arr.remark;
		$scope.editId = arr.transaction_id;
		$scope.currBal = prev_balance;
	};
    $scope.addOperationTransactionData = function (operation_id) {
        var err = 1;
		var type = angular.element("#selTranType").val();
        if (angular.element("#selTranType").val() == '') {
            angular.element("#selTranTypeErr").text("Please select one  type");
            err = 0;
        }
		if(type=='T'){ 
			if (angular.element("#seltransferaccount").val() == '') {
				angular.element("#seltransferaccountErr").text("Please select one account");
				err = 0;
        	}
			if (angular.element("#selparticular").val() == '') {
				angular.element("#selparticularErr").text("Select a particular name");
				err = 0;
        	}
			if (angular.element("#selparticular").val() == 0 && angular.element("#particulars").val() == '') {
				angular.element("#particularsErr").text("Please enter a name");
				err = 0;
        	}
           
		}else{
			if (angular.element("#selBenId").val() == '') {
				angular.element("#selBenIdErr").text("Please select one name");
				err = 0;
        	}
			
		}
         
        if (angular.element("#selAmount").val() == '') {
            angular.element("#selAmountErr").text("Enter some amount");
            err = 0;
        } else if (angular.element("#selAmount").val() < 0) {
            angular.element("#selAmountSmallerErr").text("Amount should be positive"); 
            err = 0;
        } 
        
        if (err == 1) {
            angular.element("#selAmountSmallerErr").text("");
			if(type=='T'){
				if(angular.element("#seltransferaccount").val()==1){
					var table1= 'cfs_provision_acc';
					var table2= 'cfs_provision_trans';	
					var field1= 'provision_id';
				}
				if(angular.element("#seltransferaccount").val()==2){
					var table1= 'cfs_prodry_acc';
					var table2= 'cfs_prodry_trans';	
					var field1= 'prodry_id';
				}
				if(angular.element("#seltransferaccount").val()==3){
					var table1= 'cfs_reimbursement';
					var table2= 'cfs_reim_trans';	
					var field1= 'reimburstment_id';
				}
				if(angular.element("#selparticular").val()==0){
					var particularsname =  angular.element("#particulars").val();
					var particularsId = 0;	
				}else{
					var particularsname =  '';
					var particularsId = angular.element("#selparticular").val();
				}
				var data = {
					'operation_id': operation_id,
					'company_id': angular.element("#selCompanyId").val(),
					'trans_type': 'D',
					'seltransferaccount': angular.element("#seltransferaccount").val(),
					'particulars': particularsname,
					'particularsId': particularsId,
					'beneficiary_id':0,
					'amount': angular.element("#selAmount").val(),
					'remark': angular.element("#remark").val(),
					'table1': table1,
					'table2':table2,
					'field1':field1
				};

				$http.post("addoperationtransactiondatawithtransfer/", data).success(function (response) {
					window.location.href = "/operation";
				});
			}else{
				var data = {
					'operation_id': operation_id,					
					'beneficiary_id': angular.element("#selBenId").val(),
                    'trans_type': angular.element("#selTranType").val(),
					'amount': angular.element("#selAmount").val(),
                    'remark': angular.element("#remark").val(),
                    'transfered_account_type_id': 0
					
				};
           // alert(JSON.stringify(data));
				$http.post("addoperationtransactiondata/", data).success(function (response) {
					window.location.href = "/operation";
				});
			}
        }
    };
	$scope.updateOperationData = function(id,currBal){
		var err = 1;
        if (angular.element("#tran_type").val() == '') {
            angular.element("#tran_typeErr").text("Please select one  type");
            err = 0;
        }
        if (angular.element("#ben_name").val() == '') {
            angular.element("#ben_nameErr").text("Please select one name");
            err = 0;
        }
        if (angular.element("#amount").val() == '') {
            angular.element("#amountErr").text("Enter some amount");
            err = 0;
        } else if (angular.element("#amount").val() < 0) {
            angular.element("#amountSmallerErr").text("Amount should be positive");
            err = 0;
        } 
        else {
          /*if (angular.element("#tran_type").val() == 'D' && parseInt(angular.element("#amount").val()) > parseInt(currBal)) {
                angular.element("#amountSmallerErr").text("Amount can not be greater than current balance");
                err = 0;
           }*/
		   if (angular.element("#tran_type").val() == 'D' && parseInt(angular.element("#amount").val()) <= parseInt(currBal)) {
                angular.element("#amountSmallerErr").text("");
           }
        }
		if(err==1){
			 var data = {
					'beneficiary_id': angular.element("#ben_name").val(),
					'amount': angular.element("#amount").val(),
					'trans_type': angular.element("#tran_type").val(),
					'remark': angular.element("#remarks").val()
				};
				if (id > 0) {
					$http.post("updateOperationTransactionList/" + id, data).success(function (response) {
						window.location.href = "/operation";
					});
				}
		}
	};
	
	$scope.doDelete = function (id) {
        var deleteUser = $window.confirm('Are you absolutely sure you want to delete?');
        if (deleteUser) {
           $http.get("deleteoperationtransactionlist/" + id).success(function (response) {
                    window.location.href = "/operation";
                });
		}
			
	};
    //Credit Debit List
    $scope.showmydiv = function (id, opbal, type) {
        //alert(id)
        //alert(opbal)
        $scope.mydiv = false;
		$scope.prev_balance = opbal;
        if (type == 'ALL'){
			$http.get("getOperationCreditList/" + id).success(function (response) {
                $scope.creditlist = response;
            });
			$http.get("getOperationDebitList/" + id).success(function (response) {
                $scope.debitlist = response;
            });
            angular.element("#displayOperation1").show();
			angular.element("#displayOperation2").show();
		}else if(type == 'C') {
            $http.get("getOperationCreditList/" + id).success(function (response) {
               
                $scope.creditlist = response;
                 //console.log($scope.creditlist);

            });
            angular.element("#displayOperation1").show();
            angular.element("#displayOperation2").hide();
        }
        else if (type == 'D') {
            $http.get("getOperationDebitList/" + id).success(function (response) {
                $scope.debitlist = response;
            });
            angular.element("#displayOperation2").show();
            angular.element("#displayOperation1").hide();
        }else{
			angular.element("#displayOperation1").hide();
			angular.element("#displayOperation2").hide();
		}
    };
    $scope.getTotalAmount = function (arr) {
        var sum = 0;
        if (arr.length > 0) {
            for (var i = 0; i < arr.length; i++) {
                sum = sum + arr[i].amount;
            }
        }
        return sum;
    };
    $scope.goBack = function () {
            $scope.mydiv = true;
        }; 
    
});

app.controller('reimbursementController', function ($http, DataService, $scope, $location, $cookies, $rootScope) {
    if ($rootScope.userId == 0) {
        window.location.href = "/";
    }
    var company_id = $rootScope.company_id;
    $scope.reimbursementlist = [];
    $scope.reimlist = [];
    $scope.mydiv = true;
    $scope.showModal = false;

    $http.get("getBenificiaryList").success(function (response) {
        $scope.benlist = response;
    });

    $http.get("getreimbursementlist/" + company_id).success(function (response) {
        $scope.reimbursementlist = [];
        $scope.r = response;
        $scope.companies = response;
        for (var i = 0; i < $scope.r.length; i++) {
            var cc = DataService.createNew('getreimbursementdetailslist/',$scope.r[i].id, 0);
            $scope.reimbursementlist[i] = { 'id': $scope.r[i].id, 'name':$scope.r[i].name, 'details': cc};
        }
    });

    $scope.getAccountList = function (c) {
        $scope.reimlist = [];
        var id = c;
        $http.get("reimlistbyid/" + id).success(function (response) {
            $scope.reimlist = response;
        });
    };

    $scope.getAllList = function (c1,c2) {
        var companyId = c1;
        var reimId = c2;
        if (c1 == '' || c1 == undefined) {
            companyId = 0;
        }
        if (c2 == '' || c2 == undefined) {
            reimId = 0;
        }
        $http.get("getreimbursementlist/" + companyId).success(function (response) {
            $scope.reimbursementlist = [];
            $scope.r = response;
            for (var i = 0; i < $scope.r.length; i++) {
                var cc = DataService.createNew('getreimbursementdetailslist/', $scope.r[i].id, reimId);
                $scope.reimbursementlist[i] = { 'id': $scope.r[i].id, 'name': $scope.r[i].name, 'details': cc };
            }
        });
    };

    $scope.getTotal = function (fieldname, arr) {
        var total = 0, c;
        angular.forEach(arr.details, function (element) {
            c = element;
            if (fieldname == 'OP')
                total += c.op_balance;
            if (fieldname == 'C')
                total += c.total_credits;
            if (fieldname == 'D')
                total += c.total_debits;
            if (fieldname == 'TOT')
                total += c.op_balance + c.total_credits - c.total_debits;
        });
        if (!isNaN(total))
            return total;
        else
            return 0;
    };

    $scope.openpopup = function (c) {
        $scope.showModal = true;
        $scope.editablelists = c;
        $scope.selEditAccount = $scope.editablelists.acc_name;
    };

    $scope.addReimbursementTransactionData = function (reimburstment_id) {
        var err = 1;
        if (angular.element("#selTranType").val() == '') {
            angular.element("#selTranTypeErr").text("Please select one  type");
            err = 0;
        }
        if (angular.element("#selBenId").val() == '') {
            angular.element("#selBenIdErr").text("Please select one name");
            err = 0;
        }
        if (angular.element("#selAmount").val() == '') {
            angular.element("#selAmountErr").text("Enter some amount");
            err = 0;
        } 
        else {
            if (angular.element("#selTranType").val() == 'D' && parseInt(angular.element("#selAmount").val()) > parseInt(angular.element("#selCurrBal").val())) {
                angular.element("#selAmountSmallerErr").text("Amount can not be greater than current balance");
                err = 0;
            }
        }
        if (err == 1) {
            angular.element("#selAmountSmallerErr").text("");
            var data = {
                'reimburstment_id': reimburstment_id,
                'trans_type': angular.element("#selTranType").val(),
                'amount': angular.element("#selAmount").val(),
                'benificiary_id': angular.element("#selBenId").val(),
                'remark': angular.element("#remark").val()
            };
            $http.post("addreimbursementtransactiondata/", data).success(function (response) {
                window.location.href = "/reimbursement";
            });
        }
    };
    //Credit Debit List
    $scope.showmydiv = function (id, type) {
        $scope.mydiv = false;
        if (type == 'ALL' || type == 'C') {
            $http.get("getReimCreditList/" + id).success(function (response) {
                $scope.creditlist = response;
            });
            angular.element("#displayOperation1").show();
            if(type == 'C') angular.element("#displayOperation2").hide();
        }
        if (type == 'ALL' || type == 'D') {
            $http.get("getReimDebitList/" + id).success(function (response) {
                $scope.debitlist = response;
            });
            angular.element("#displayOperation2").show();
            if (type == 'D') angular.element("#displayOperation1").hide();
        }
    };

    $scope.getTotalAmount = function (arr) {
        var sum = 0;
        if (arr.length > 0) {
            for (var i = 0; i < arr.length; i++) {
                sum = sum + arr[i].amount;
            }
        }
        return sum;
    }

    $scope.goBack = function () {
        $scope.mydiv = true;
    };
});

app.controller('transactionController', function ($http, DataService, $scope, $location, $cookies, $rootScope) {
    if ($rootScope.userId == 0) {
        window.location.href = "/";
    }
    var company_id = $rootScope.company_id;
    $scope.cookie_company_id = company_id;
    $scope.showModal = false;
	$scope.branchname='';
    $http.get("companylist/" + company_id).success(function (response) {
        $scope.companies = response;
        
    });
	$scope.branchlist = [];
	$http.get("branchlist").success(function (response) {
		$scope.branchlist = response;
	});
    $scope.operationlist = [];
	$http.get("companylist/" + company_id).success(function (response) {
        $scope.operationlist = [];
        $scope.r = response;
        $scope.companies = response;
        for (var i = 0; i < $scope.r.length; i++) {
            var cc = DataService.createNew('getTransactionDetailsList/'+$scope.r[i].id+'/0/','0000-00-00', '0000-00-00');
            $scope.operationlist[i] = { 'id': $scope.r[i].id, 'name': $scope.r[i].name, 'code':$scope.r[i].code, 'details': cc };
        }
		//console.log($scope.operationlist);
    });
    /*************added on 24-10-2017*****************/
    $scope.cookie_company = '';
    $http.get("getCookieCompanyDetails/" + company_id).success(function (response) {
        
        $scope.cookie_company_code = response[0].code;
       
        
    });
	
	$scope.getAllList = function(){
		$scope.branchname='';
		var start= $scope.start_date;
		var end= $scope.end_date;
		if($scope.selBranch==undefined || $scope.selBranch=='undefined' || $scope.selBranch==''){
				$scope.selBranch=0;
		}
		if($scope.start_date==undefined || $scope.start_date=='undefined' || $scope.start_date==''){
				start='0000-00-00';
		}
		if($scope.end_date==undefined || $scope.end_date=='undefined' || $scope.end_date==''){
				end='0000-00-00';
		}
		if($scope.selBranch > 0){
			$scope.branchname=angular.element("#brid option:selected").text();	
			console.log($scope.branchname);
		}
		
		$http.get("companylist/"+company_id).success(function (response) {
			$scope.operationlist = [];
			$scope.r = response;
			$scope.companies = response;
			for (var i = 0; i < $scope.r.length; i++) {
				var cc = DataService.createNew('getTransactionDetailsList/'+$scope.r[i].id+'/'+$scope.selBranch+"/", start, end);
				$scope.operationlist[i] = { 'id': $scope.r[i].id, 'name': $scope.r[i].name, 'code':$scope.r[i].code, 'details': cc };
			}
			
		});
	};
	
	$scope.getTotal = function (companycode) {
        var total = 0, c, cc;
        for (var i = 0; i < $scope.operationlist.length; i++) {
			//console.log($scope.operationlist[i].code);
			if($scope.operationlist[i].code==companycode){ 
				cc = $scope.operationlist[i];
				angular.forEach(cc.details, function (element) {
					c = element;
					if(c.trans_type=='C')
						total += c.amount;
					if(c.trans_type=='D')
						total -= c.amount;
				});
			}
        }
        if (!isNaN(total))            
            return total;            
        else
            return 0;
    };
    /*$http.get("getoperationcompanyList/0/0").success(function (response) {
        $scope.r = response;
        for (var i = 0; i < $scope.r.length; i++) {
            var cc = DataService.createNew('getbalancebycompanyid/', $scope.r[i].id, 0);
            $scope.results[i] = { 'id': $scope.r[i].id, 'name': $scope.r[i].name, 'details': [cc] };
        }
        console.log($scope.results);
    });  
    $scope.getTotal = function (fieldname) {
        var total = 0, c;
        for (var i = 0; i < $scope.results.length; i++) {
            var c = $scope.results[i].details[0];
            if (fieldname == 'C')
                total += c.total_credit;
            if (fieldname == 'D')
                total += c.total_debit;
        }
        if (!isNaN(total))
            return total;
        else
            return 0;
    };
    $scope.getAllList = function () {
        alert("Wait..");
    }*/
    //for graph..
    //Line Graph
    $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
    $scope.series = ['Credit', 'Debit'];
    $scope.data = [
      [65, 59, 80, 81, 56, 55, 40],
      [28, 48, 40, 19, 86, 27, 90]
    ];
    //Column Graph..
    $scope.labels1 = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
    $scope.series1 = ['Credit', 'Debit'];

    $scope.data1 = [
      [65, 59, 80, 81, 56, 55, 40],
      [28, 48, 40, 19, 86, 27, 90]
    ];
    //graph end
});


app.directive('modal', function () {
    return {
        template: '<div class="modal fade">' +
            '<div class="modal-dialog">' +
              '<div class="modal-content operationModal">' +
                '<div class="modal-header">' +
                  '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                  '<h4 class="modal-title">{{ title }}</h4>' +
                '</div>' +
                '<div class="modal-body" ng-transclude></div>' +
              '</div>' +
            '</div>' +
          '</div>',
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: true,
        link: function postLink(scope, element, attrs) {
            scope.title = attrs.title;

            scope.$watch(attrs.visible, function (value) {
                if (value == true)
                    $(element).modal('show');
                else
                    $(element).modal('hide');
            });

            $(element).on('shown.bs.modal', function () {
                scope.$apply(function () {
                    scope.$parent[attrs.visible] = true;
                });
            });

            $(element).on('hidden.bs.modal', function () {
                scope.$apply(function () {
                    scope.$parent[attrs.visible] = false;
                });
            });
        }
    };
});

//Factory to get all the data
app.factory("DataService", function ($http) {
    var DataService = function (url, companyId, bankId) {
            var results = $http.get(url + companyId + "/" + bankId);
            var self = this;
            results.then(function (response) {
                angular.extend(self, response.data);
            });
    };
   
    return {
        createNew: function (url, companyId, bankId) {
            return new DataService(url, companyId, bankId);
        }
    };
});
