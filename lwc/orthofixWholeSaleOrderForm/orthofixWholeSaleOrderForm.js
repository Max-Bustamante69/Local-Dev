import { LightningElement, track, wire, api} from 'lwc';
import getPicklistValues from "@salesforce/apex/OrthoFixOrderFormController.getPicklistValues";
import orthofix_navigatetowholesalelistview from '@salesforce/label/c.orthofix_navigatetowholesalelistview';
import orthofix_navigatetocontactlistview from '@salesforce/label/c.orthofix_navigatetocontactlistview';
import orthofix_navigatetoNPIRegistry from '@salesforce/label/c.orthofix_navigatetoNPIRegistry';
import {showSuccess, showError, showReduceErrors, showLoader, hideLoader} from 'c/orthofixNotificationUtility';
import getCurrentUser from "@salesforce/apex/OrthofixWholesaleOrderController.getCurrentUser";
import saveOrder from "@salesforce/apex/OrthofixWholesaleOrderController.saveOrder";
import submitAndSave from "@salesforce/apex/OrthofixWholesaleOrderController.submitAndSave";
import getOrder from "@salesforce/apex/OrthofixWholesaleOrderController.getOrder";
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import {NavigationMixin} from 'lightning/navigation';



export default class OrthofixWholeSaleOrderForm extends NavigationMixin(LightningElement) {

    @api selectedRecordType;
    @api selectedRecordTypeName;
    @api recordId;
    @track booleanOrderStatus = false;
    @track
    formData = {
        wholeSaleInformation: {
            account :{},
            physician:{},
            prescriber:{}

        }
    };

    @wire(getCurrentUser)
    wiredUser({ error, data }) {
        if (data) {
            this.currentUser = data;
            this.checkUserRoleFitter = this.currentUser.UserRole.Name === 'BGT Fitter';
            console.log(' this.disableUploadDocuments',  this.checkUserRoleFitter);
        } else if (error) {
            this.error = error;
        }
    }

    accountSelectedRecord;
    wholesaleAccountLookup;
    navigateToWholeSaleListview;
    showPhysicianLookup = true;
    showShippingMethod = false;

    @track editedData = {};

    label={
        navigatetoWholesalelistview: orthofix_navigatetowholesalelistview,
        navigateToNPIRegistryUrl: orthofix_navigatetoNPIRegistry,
        navigatetocontactlistview: orthofix_navigatetocontactlistview
    }

    @track
    picklistOptions = {
        territoryManagers: [],
        assignment: [],
        deliverytype:[],
        favoriteWholeSaleCustomers:[],
        favoritePhysicians:[],
        shippingmethod:[]

    };

    connectedCallback() {
        this.sfdcbaseUrl = window.location.origin;
        this.navigateToWholeSaleListview = this.sfdcbaseUrl + this.label.navigatetoWholesalelistview;
        this.navigateToPhysicianListview = this.sfdcbaseUrl + this.label.navigatetocontactlistview;
        this.getPicklistOptions();
        console.log('this.recordId', this.recordId);
        if (this.recordId) {
            this.getOrder();
        }
    }

    requiredFields = {
        wholeSaleInformation: {
            account:{
                favPhysician :false
            },
            physician:{
                firstName:false,
                lastName:false,
                npi:false
            },
            prescriber:{
                firstName:false,
                lastName:false,
                npi:false
            },
            territoryManager: true,
            assignment:true,
            shippingmethod:true,
            ponumber:true,
            deliverytype:true
        }
    };

    data = {
        wholeSaleInformation: {}
            
    };

    validateForm() {
        let isValid = true;
    
        console.log('this.requiredFields.wholeSaleInformation' +this.requiredFields.wholeSaleInformation);
        console.log('this.requiredFields.wholeSaleInformation stringify' +JSON.stringify(this.requiredFields.wholeSaleInformation));
        for (const key in this.requiredFields.wholeSaleInformation) {

            if (this.requiredFields.wholeSaleInformation.hasOwnProperty(key)) {
                
                if (!this.requiredFields.wholeSaleInformation[key]) {
                 
                    isValid = false;
                    showError('Error', 'Please fill all required fields.', 'error');
                    break;
                }
            }
        }
    
        return isValid;
    }

    getOrder() {
        console.log('recordId', this.recordId);
        showLoader(this);
        getOrder({id: this.recordId})
            .then((result) => {
                let orderData = JSON.parse(JSON.stringify(result));
                console.log("showOrdershortdesc and " + JSON.stringify(orderData))
                console.log('status '+JSON.stringify(orderData.Status))
                this.orderStatus = orderData.Status;
                // if (orderData.Status === "Submitted To Orthofix") {
                //     this.hideSaveButtons = true;
                // }
                
                // if (orderData.Status === "Submitted To IA") {
                //     this.showheader = false;
                //     this.disableForm = true;
                //     this.clinicalDisableForm = true;
                //     this.hideSaveButtons = true;
                //     if (this.oktofitIcon != null) {
                //         this.showOktofit = true;
                //     }
                // }
                // else if (orderData.Status === "Canceled"){
                //     console.log("come here in canceled status");
                //     this.disableForm = true;
                //     this.showSubmit = false;
                //     this.orderCanceled = true;
                //     this.clinicalDisableForm = true;
                //     this.hideSaveButtons = true;
                //     this.makeEventReadOnly=true;
                //     this.hideAllButtons = false;
                    
                // }
                // else {
                //     this.clinicalDisableForm = false;
                //     this.disableForm = false;
                //     this.makeEventReadOnly=false;
                //     this.hideSaveButtons = false;
                //     this.showSubmit=true;
                //     //this.disableTabsetClass = true;
                //     if(orderData.Status === "Started" && orderData.isChannelScriptOrder === true){
                //         this.isChannelScriptOrder = true;
                //         this.requiredFields["dateOfPrescription"] = false;
                //         this.isRequired = false;
                //     }
                // }

                

                this.formData = orderData;
                this.editedData = orderData;
                console.log(JSON.stringify(this.formData));

                // this.handleAddFavoritesButton({fieldName: 'patientInformation.prescriber.firstName'});
               

                hideLoader(this);
            })
            .catch((error) => {
                hideLoader(this);
                showReduceErrors(this, error);
            });
    }

    handleSave() {
        let validaton = false;
        // validaton = this.validationCheck();
        validaton = false;
        if (validaton === false) {
            this.save(true);            
        }


    }

    handleSaveandSubmit(){
        let validaton = false;
        // validaton = this.validationCheck();
        validaton = false;
        if (validaton === false) {
            this.booleanOrderStatus = true;
            this.save(true);            
        }
    }


    save(showSuccessMsg) {
        debugger
        console.log('inside save method');
        showLoader(this);
        console.log('inside save method log 2');
        if(this.selectedRecordType){
            this.formData.wholeSaleInformation.recordtypeId = this.selectedRecordType;
        }
        

        let orderData = JSON.parse(JSON.stringify(this.formData));
        console.log('Object length', Object.keys(orderData).length);


        if (Object.keys(orderData).length !== 0 && orderData.constructor === Object) {
           
            if (!orderData.wholeSaleInformation.account || this.isObjectEmpty(orderData.wholeSaleInformation.account)) {
                orderData.wholeSaleInformation.account = null;
            }

            if (!orderData.wholeSaleInformation.physician || this.isObjectEmpty(orderData.wholeSaleInformation.physician)) {
                orderData.wholeSaleInformation.physician = null;
            }
           

            let wholeSaleInformation = {
                id: this.formData.id,
                name: this.formData.name,
                status: this.booleanOrderStatus === true ? "Submitted To Orthofix" : "",
                wholeSaleInformation: this.formData.wholeSaleInformation,
            };

            console.log('Saved wholeSaleInformation', JSON.stringify(wholeSaleInformation));
            let isCreate = !wholeSaleInformation.id;
            saveOrder({order: wholeSaleInformation})

                .then((result) => {

                    this.recordId = result;
                    this.editedData.id = result;
                    if (isCreate) {
                        this.navigateToOrderPage(this.recordId);
                    } else {
                        this.getOrder();
                    }
                    if (showSuccessMsg) {
                        showSuccess(this, 'Order Saved', 'Order saved successfully');
                    }
                })
                .catch((error) => {
                    console.log('order in catch block 3');
                    console.log(error);
                    console.log(error.body);
                    if (error.body) {
                        console.log(error.body.message);
                    }

                    hideLoader(this);
                    showReduceErrors(this, error);
                });
        } else {
            LightningConfirm.open({
                message: 'The form has empty data',
                variant: 'headerless',
                label: 'create Order',

            });
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        }

        return this.isNavigate;
    }

    isObjectEmpty(obj) {
        return Object.keys(obj).length <= 0;
    }
    navigateToOrderPage(recordId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Order',
                actionName: 'view'
            },
        });
    }

    handleValueSelectedOnAccount(event){
        try {
            console.log(JSON.parse(JSON.stringify(event.detail) ));
            let account = event.detail;
            console.log('account wholsale', JSON.stringify(account));
            this.wholesaleAccountLookup = account;
            this.populateAccountData(account);
        }catch (e) {
            console.log('Error', JSON.stringify(e));
        }
    }



    get wholesaleAccountAddress(){
        console.log('this.formData', this.formData);
        console.log('this.formData.wholeSaleInformation', this.formData.wholeSaleInformation);
        console.log('this.formData.wholeSaleInformation.account', this.formData.wholeSaleInformation.account);
        if(this.wholesaleAccountLookup){
            console.log('log wlog1');
            return {
                street:this.wholesaleAccountLookup.shippingStreet,
                city:this.wholesaleAccountLookup.shippingCity,
                country:this.wholesaleAccountLookup.shippingCountry,
                province:this.wholesaleAccountLookup.shippingState,
                postalCode:this.wholesaleAccountLookup.shippingPostalCode,
                address2:this.wholesaleAccountLookup.address2,
            };
            
        }else if(this.formData && this.formData.wholeSaleInformation && this.formData.wholeSaleInformation.account){
            console.log('log wlog2');
            return {
                street:this.formData.wholeSaleInformation.account.street,
                city:this.formData.wholeSaleInformation.account.city,
                country:this.formData.wholeSaleInformation.account.country,
                province:this.formData.wholeSaleInformation.account.province,
                postalCode:this.formData.wholeSaleInformation.account.postalCode,
                address2:this.formData.wholeSaleInformation.account.address2,
            };
        }else{
            return {
                street:null,
                city:null,
                country:null,
                province:null,
                postalCode:null,
                address2:null,
            };
        }
    }

    handleInputChange(event){
        debugger;
        let detail = event.target;
        console.log('detail' , detail);
        let arr = detail.name.split('.');
        console.log('arr' , arr);
        let fieldName = arr[1];
        console.log('fieldName' , fieldName);
        this.editedData[detail.name] = detail.value;
        if (arr.length == 1) {
            this.editedData[detail.name] = detail.value;
            console.log('length = 1');
        }else if (arr.length == 3) {
            console.log('length = 3');
            let tabName = arr[0];
            let innerObjectName = arr[1];
            let fieldName = arr[2];
            let changedItem = {[fieldName]: detail.value};
            console.log('changedItem', changedItem);

            if (!this.editedData[tabName]) {
                this.editedData[tabName] = {};
            }
            if (!this.editedData[tabName][innerObjectName]) {
                this.editedData[tabName][innerObjectName] = {};
            }
            this.editedData[tabName][innerObjectName] = {...this.editedData[tabName][innerObjectName], ...changedItem};
        }else{
            let tabName = arr[0];
            let fieldName = arr[1];
            let changedItem = {[fieldName]: detail.value};
            this.editedData[tabName] = {...this.editedData[tabName], ...changedItem};
            console.log('this.editedData[tabName]' , this.editedData[tabName]);
        }
        
        console.log('fieldName>>2' , fieldName);
        if (fieldName == "territoryManager") {
            this.formData.wholeSaleInformation.territoryManager = detail.value;
        }
        if(fieldName == "assignment"){
            this.formData.wholeSaleInformation.assignment = detail.value;
            if(detail.value === 'No Physician Assigned'){
                this.showPhysicianLookup = false;
            }else this.showPhysicianLookup = true;
        }
        if(fieldName == "deliverytype"){
            this.formData.wholeSaleInformation.deliverytype = detail.value;
            if(detail.value === 'Rep Delivery'){
                this.showShippingMethod = false;
            }else this.showShippingMethod = true;
        }
        if(fieldName == "shippingmethod"){
            this.formData.wholeSaleInformation.shippingmethod = detail.value;
        }
        if(fieldName == "ponumber"){
            this.formData.wholeSaleInformation.ponumber = detail.value;
        }
       
        console.log('formData', JSON.stringify(this.formData));
        console.log('editedData', JSON.stringify(this.editedData));
    }

    physicianSelect(event) {
        console.log('console physican select');
        try {
            console.log(JSON.stringify(event.detail.selectedRecord));
            let contact = event.detail.selectedRecord;
            console.log('contact physician', JSON.stringify(contact));
            //this.formData.wholeSaleInformation.physician.id = contact.id;
            this.pupulatePhysicianData(contact);
        }catch (e) {
            console.log('Error', JSON.stringify(e));
        }
    }

  

    handleChangeFavoriteWholeSaleOrder(event){
        debugger;
        this.handleInputChange(event);
        let value = event.target.value;
        let account;
        console.log('this.picklistOptions.favoriteWholeSaleCustomers', JSON.stringify(this.picklistOptions.favoriteWholeSaleCustomers));
        this.picklistOptions.favoriteWholeSaleCustomers.forEach(el=>{
            if(el.account.id==value){
                account = el.account;
            }
        });
        console.log('account', JSON.stringify(account));
        this.populateAccountData(account);
    }

    populateAccountData(account) {
        console.log('Log populateaccount');
        if (!account) {
            console.log('inside no account');
            return;
        }
        console.log('account.id',account.id);
        if(account.id){
            this.formData.wholeSaleInformation.account.Id = account.id;
        }
        this.formData.wholeSaleInformation.account.Name = account.mainField || account.name || '';

        
        if (account.shippingStreet) {
            console.log('account.shippingStreet',account.shippingStreet);
            this.formData.wholeSaleInformation.account.street = account.shippingStreet;
            this.editedData.wholeSaleInformation.account.street = account.shippingStreet;
        }
    
        if (account.shippingCity) {
            this.formData.wholeSaleInformation.account.city = account.shippingCity;
            this.editedData.wholeSaleInformation.account.city =  account.shippingCity;
        }
    
        if (account.shippingCountry) {
            this.formData.wholeSaleInformation.account.country = account.shippingCountry;
            this.editedData.wholeSaleInformation.account.country = account.shippingCountry;
        }
    
        if (account.shippingState) {
            this.formData.wholeSaleInformation.account.province = account.shippingState;
            this.editedData.wholeSaleInformation.account.province = account.shippingState;
        }
    
        if (account.shippingPostalCode) {
            this.formData.wholeSaleInformation.account.postalCode = account.shippingPostalCode;
            this.editedData.wholeSaleInformation.account.postalCode = account.shippingPostalCode;

        }
        console.log('this.formData>>2', JSON.stringify(this.formData));
    }


    
    handleChangeFavoritePhysicians(event){
        this.handleInputChange(event);
        let value = event.target.value;
        let contact;
        console.log('this.picklistOptions.favoritePhysicians', JSON.stringify(this.picklistOptions.favoritePhysicians));
        this.picklistOptions.favoritePhysicians.forEach(el=>{
            if(el.contact.id==value){
                contact = el.contact;
            }
        });
        console.log('contact', JSON.stringify(contact));
        this.pupulatePhysicianData(contact);
    }

    pupulatePhysicianData(contact){
        if(!contact){
            console.log('inside no contact');
            return;
        }
        if(contact.id){
            console.log('contact.id', contact.id);
            this.formData.wholeSaleInformation.physician.id = contact.id;
            //this.editedData.wholeSaleInformation.physician.id = contact.id;
        }
        if(contact.firstName) {
            this.formData.wholeSaleInformation.physician.firstName = contact.firstName;
            this.template.querySelector('lightning-input[data-name="wholeSaleInformation.physician.firstName"]').value = contact.firstName;
            //this.editedData.wholeSaleInformation.physician.firstName = contact.firstName;
        }
        if(contact.lastName) {
            this.formData.wholeSaleInformation.physician.lastName = contact.lastName;
            this.template.querySelector('lightning-input[data-name="wholeSaleInformation.physician.lastName"]').value = contact.lastName;
            //this.editedData.wholeSaleInformation.physician.lastName = contact.lastName;
        }
        if(contact.npi){
            this.formData.wholeSaleInformation.physician.npi = contact.npi;
            this.template.querySelector('lightning-input[data-name="wholeSaleInformation.physician.npi"]').value = contact.npi;
            //this.editedData.wholeSaleInformation.physician.npi = contact.npi;
        }

        console.log('this.formData>>3', JSON.stringify(this.formData));
        console.log('this.editeddate>>3', JSON.stringify(this.editedData));
    }

    
    

    getPicklistOptions() {
        getPicklistValues()
            .then((result) => {
                this.picklistOptions.territoryManagers = result.territoryManagers;
                this.picklistOptions.assignment = result.assignment;
                this.picklistOptions.deliverytype = result.deliverytype;
                this.picklistOptions.favoriteWholeSaleCustomers = result.favoriteWholeSaleCustomers;
                this.picklistOptions.favoritePhysicians = result.favoritePhysicians;
                this.picklistOptions.shippingmethod = result.shippingmethod;
            })
            .catch((error) => {
                showReduceErrors(this, error);
            });
    }

    handleAddressChange(event) {
       
        if (!this.editedData.wholeSaleInformation) {
            this.editedData.wholeSaleInformation = {};
        }
        if (!this.editedData.wholeSaleInformation.account) {
            this.editedData.wholeSaleInformation.account = {};
        }
    
       
        this.editedData.wholeSaleInformation.account.street = event.target.street 
        this.editedData.wholeSaleInformation.account.city = event.target.city 
        this.editedData.wholeSaleInformation.account.province = event.target.province 
        this.editedData.wholeSaleInformation.account.country = event.target.country 
        this.editedData.wholeSaleInformation.account.postalCode = event.target.postalCode 
    
        console.log('this.editedData', JSON.stringify(this.editedData));
    }

}