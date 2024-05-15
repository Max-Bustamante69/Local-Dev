import { LightningElement, track, wire, api} from 'lwc';
import LightningConfirm from 'lightning/confirm';
import getPicklistValues from "@salesforce/apex/OrthoFixOrderFormController.getPicklistValues";
import orthofix_navigatetowholesalelistview from '@salesforce/label/c.orthofix_navigatetowholesalelistview';
import orthofix_navigatetocontactlistview from '@salesforce/label/c.orthofix_navigatetocontactlistview';
import orthofix_navigatetoNPIRegistry from '@salesforce/label/c.orthofix_navigatetoNPIRegistry';
import uploadFile from "@salesforce/apex/FileUploaderController.uploadFile";
import createContentLink from "@salesforce/apex/FileUploaderController.createContentLink";
import getFiles from "@salesforce/apex/FileUploaderController.getFiles";
import isFavorite from "@salesforce/apex/OrthofixWholesaleOrderController.isFavorite";
import isPhysicianFavorite from "@salesforce/apex/OrthofixWholesaleOrderController.isPhysicianFavorite";
import getAccountWholesaleecordValue from "@salesforce/apex/OrthofixWholesaleOrderController.getAccountWholesaleecordType";
import {showSuccess, showError, showReduceErrors, showLoader, hideLoader} from 'c/orthofixNotificationUtility';
import getCurrentUser from "@salesforce/apex/OrthofixWholesaleOrderController.getCurrentUser";
import saveOrder from "@salesforce/apex/OrthofixWholesaleOrderController.saveOrder";
import getOrder from "@salesforce/apex/OrthofixWholesaleOrderController.getOrder";
import {NavigationMixin} from 'lightning/navigation';



export default class OrthofixWholeSaleOrderForm extends NavigationMixin(LightningElement) {
    @track selectedWholesaleAccountId;
    @api selectedRecordType;
    @api selectedRecordTypeName;
    @track lastTimeCheckFavoriteRequested = 0;
    @api recordId;
    @track showAddFavoriteButton = false;
    @track showAddPhysicianFavoriteButton = false;
    @track booleanOrderStatus = false;
    @track isShowFileUploadModal = false;
    @track
    formData = {
        wholeSaleInformation: {
            account :{},
            Physician:{},
            prescriber:{}

        }
    };
    @track wholesaleAccountRecordtypeId = '';

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
    @track orderStatus = '';

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
        this.getAccountWholeSaleRecordtype();
        console.log('this.recordId', this.recordId);
        if (this.recordId) {
            this.getOrder();
        }


    }

    // get favPhysicain(){
    //     if(this.formData.wholeSaleInformation.Physician.firstName && this.formData.wholeSaleInformation.Physician.lastName){
    //         return this.formData.wholeSaleInformation.Physician.firstName + ' ' +  this.formData.wholeSaleInformation.Physician.lastName;
    //     }else null;
       
    // }

    handleAddToFavoritesClick(){
        this.formData.wholeSaleInformation.account.makeFavorite = true;

        this.showAddFavoriteButton = false;
        showSuccess(this, 'Added as Favorite', 'Note : Favorite will be saved upon order save');
    }

    handleAddToPhysicianFavoritesClick(){
        this.formData.wholeSaleInformation.Physician.makeFavorite = true;

        this.showAddPhysicianFavoriteButton = false;
        showSuccess(this, 'Added as Favorite', 'Note : Favorite will be saved upon order save');
    }

    requiredFields = {
        wholeSaleInformation: {
            account:{
                favWholesaleAccount :false
            },
            Physician:{
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
            deliverytype:true,
            favWholesaleAccount:false
        }
    };

    data = {
        wholeSaleInformation: {}
            
    };

    getOrder() {
        console.log('recordId', this.recordId);
        showLoader(this);
        getOrder({id: this.recordId})
            .then((result) => {
                let orderData = JSON.parse(JSON.stringify(result));
                console.log("showOrdershortdesc and " + JSON.stringify(orderData))
                console.log('status '+JSON.stringify(orderData.Status))
                this.orderStatus = orderData.Status;
                if (!orderData.wholeSaleInformation.Physician) {
                    orderData.wholeSaleInformation.Physician = {};
                }
                if (!orderData.wholeSaleInformation.account) {
                    orderData.wholeSaleInformation.account = {};
                }

                

                this.formData = orderData;
                this.editedData = orderData;
                console.log(JSON.stringify(this.formData));
                console.log('orderData.deliverytype', orderData.deliverytype);
                console.log('orderData.assignment', orderData.assignment);
                console.log('this.formData.deliverytype', this.formData.wholeSaleInformation.deliverytype);
                console.log('this.formData.assignment', this.formData.wholeSaleInformation.assignment);
                if(orderData.wholeSaleInformation.deliverytype ==="Ship from Corporate Office"){
                        this.showShippingMethod = true;
                    }else  this.showShippingMethod = false;

                    if(orderData.wholeSaleInformation.assignment ==="No Physician Assigned"){
                        this.showPhysicianLookup = false;
                    }else  this.showPhysicianLookup = true;

                if(this.formData.wholeSaleInformation && this.formData.wholeSaleInformation.account && this.formData.wholeSaleInformation.account.id){
                    this.selectedWholesaleAccountId = this.formData.wholeSaleInformation.account.id;
                    console.log('this.selectedWholesaleAccountId', this.selectedWholesaleAccountId);
                }
                //this.handleAddWholeSaleFavoritesButton(this.formData.wholeSaleInformation.account.id);
                hideLoader(this);
            })
            .catch((error) => {
                hideLoader(this);
                showReduceErrors(this, error);
            });
    }

    get disableForm() {
        console.log('this.orderStatus ', this.orderStatus );
        if (this.orderStatus == null || this.orderStatus == '') {
            return false;
        }
        return this.orderStatus !== 'Started';
    }

    handleAddWholeSaleFavoritesButton(value) {
        if (value) {
                this.lastTimeCheckFavoriteRequested = (new Date().getTime());
                setTimeout(async () => {
                    await this.checkFavoriteRecord(value);
                }, 500);
            
        }
    }

    handleAddPhysicianFavoritesButton(value){
        if (value) {
                this.lastTimeCheckFavoriteRequested = (new Date().getTime());
                setTimeout(async () => {
                    await this.checkPhysicianFavoriteRecord(value);
                }, 500);
            
        }
    }

    async checkFavoriteRecord(value) {
        console.log('inside checkidwholesale fav method', new Date().getTime() - this.lastTimeCheckFavoriteRequested >= 500);
        if (new Date().getTime() - this.lastTimeCheckFavoriteRequested >= 500) {
           
            if (value) {
                console.log('log 4', value);
                this.formData.wholeSaleInformation.account.isFavorite = await isFavorite({accountId: value});
                console.log('log fav 2', this.formData.wholeSaleInformation.account.isFavorite);
                this.showAddFavoriteButton = !this.formData.wholeSaleInformation.account.isFavorite;
            } else {
                console.log('log fav 3');
                this.showAddFavoriteButton = false;
            }
        } else {
            console.log('User still typing waiting');
        }
    }

    async checkPhysicianFavoriteRecord(value) {
        console.log('inside checkidwholesale fav method', new Date().getTime() - this.lastTimeCheckFavoriteRequested >= 500);
        if (new Date().getTime() - this.lastTimeCheckFavoriteRequested >= 500) {
           console.log('value>>' , value);
            if (value) {
                this.formData.wholeSaleInformation.Physician.isFavorite = await isPhysicianFavorite({contactId: value});
                this.showAddPhysicianFavoriteButton = !this.formData.wholeSaleInformation.Physician.isFavorite;
            } else {
                this.showAddPhysicianFavoriteButton = false;
            }
        } else {
            console.log('User still typing waiting');
        }
    }

    handleSave() {
        let validaton = false;
        // validaton = this.validationCheck();
        validaton = false;
        if (validaton === false) {
            this.save(true);            
        }
    }

    areAllRequiredFieldsFilled() {
      
        let formData = this.formData; 
        const requiredFields = [
            formData.wholeSaleInformation.assignment,
            formData.wholeSaleInformation.account.id,
            formData.wholeSaleInformation.deliverytype,
            formData.wholeSaleInformation.ponumber,
            formData.wholeSaleInformation.contentRecordId

        ];

        if (formData.wholeSaleInformation.deliverytype === "Ship from Corporate Office") {
            requiredFields.push(formData.wholeSaleInformation.shippingMethod);
        }
        
        if (formData.wholeSaleInformation.assignment === "Assigned to Order") {
            requiredFields.push(formData.wholeSaleInformation.Physician.id);
        }
        if (!formData.wholeSaleInformation.contentRecordId) {
            return false;
        }

        console.log('requiredFields', JSON.stringify(requiredFields));

        for (const field of requiredFields) {
            console.log('field', field);
            if (!field) {

                return false; 
            }
        }
    
        return true; 
    }

    handleSaveandSubmit(){
        if (this.areAllRequiredFieldsFilled()) {
            this.booleanOrderStatus = true;
            this.save(true);  
            setTimeout(() => {
                window.location.reload();
            }, 8000);          
        }else{
            if (!this.formData.wholeSaleInformation.contentRecordId) {
                showError(this, 'Validation Error', 'Please upload a PO before submitting the order');
            } else {
                showError(this, 'Validation Error', 'Please fill in all required fields before submitting the order');
            }
        }
    }


    save(showSuccessMsg) {
        debugger
        console.log('inside save method');
        showLoader(this);
        console.log('inside save method log 2');
        
        

        let orderData = JSON.parse(JSON.stringify(this.formData));
        console.log('Object length', Object.keys(orderData).length);


        if (Object.keys(orderData).length !== 0 && orderData.constructor === Object) {

            if(this.selectedRecordType){
                this.formData.wholeSaleInformation.recordtypeId = this.selectedRecordType;
            }
            if (!orderData.wholeSaleInformation.account || this.isObjectEmpty(orderData.wholeSaleInformation.account)) {
                orderData.wholeSaleInformation.account = null;
            }

            if (!orderData.wholeSaleInformation.Physician || this.isObjectEmpty(orderData.wholeSaleInformation.Physician)) {
                orderData.wholeSaleInformation.Physician = null;
            }
           

            let wholeSaleInformation = {
                id: this.formData.id,
                name: this.formData.name,
                status: this.booleanOrderStatus === true ? "Submitted" : "",
                wholeSaleInformation: this.formData.wholeSaleInformation,
            };

            console.log('Saved wholeSaleInformation', JSON.stringify(wholeSaleInformation));
            let isCreate = !wholeSaleInformation.id;
            saveOrder({order: wholeSaleInformation})

                .then((result) => {

                    this.recordId = result;
                    console.log('this.recordid', this.recordId);
                    this.editedData.id = result;
                    console.log('this.editedData.id', this.editedData.id);
                    if(this.formData.wholeSaleInformation.contentRecordId !=null && this.formData.wholeSaleInformation.contentRecordId.startsWith("068")){
                        createContentLink({contentVersionId: this.formData.wholeSaleInformation.contentRecordId, recordId: this.recordId})
                        .then((result) => {
                           console.log('result cntent', result);
                        })
                        .catch((error) => {
                            console.log('error:' + JSON.stringify(error));
                            hideLoader(this);
                            showReduceErrors(this, error);
                        });
                    }
                    
                    if (showSuccessMsg) {
                         if (isCreate) {
                            this.navigateToOrderPage(this.recordId);
                            } else {
                            this.getOrder();
                            }
                    
                        showSuccess(this, 'Order Saved', 'Order saved successfully');
                    
                }
                if(!showSuccessMsg){}
                    

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
            console.log(JSON.parse(JSON.stringify(event.detail)));
            let account = event.detail;
            // this.handleInputChange(event);
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
                street:this.formData.wholeSaleInformation.street,
                city:this.formData.wholeSaleInformation.city,
                country:this.formData.wholeSaleInformation.country,
                province:this.formData.wholeSaleInformation.province,
                postalCode:this.formData.wholeSaleInformation.postalCode,
                address2:this.formData.wholeSaleInformation.address2,
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
        if(fieldName == "shippingMethod"){
            this.formData.wholeSaleInformation.shippingMethod = detail.value;
        }
        if(fieldName == "ponumber"){
            this.formData.wholeSaleInformation.ponumber = detail.value;
        }
       
        console.log('formData', JSON.stringify(this.formData));
        console.log('editedData', JSON.stringify(this.editedData));
        //this.handleAddWholeSaleFavoritesButton(value);
    }



    physicianSelect(event) {
        console.log('console physican select');
        try {
            console.log(JSON.stringify(event.detail.selectedRecord));
            let contact = event.detail.selectedRecord;
            console.log('contact Physician', JSON.stringify(contact));
            //this.formData.wholeSaleInformation.Physician.id = contact.id;
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
            this.formData.wholeSaleInformation.account.id = account.id;
        }
        this.formData.wholeSaleInformation.account.isFavorite = !!account.isFavorite;
        this.formData.wholeSaleInformation.account.Name = account.mainField || account.name || '';
        
        if (account.shippingStreet) {
            console.log('account.shippingStreet',account.shippingStreet);
            this.formData.wholeSaleInformation.street = account.shippingStreet;
           
        }
    
        if (account.shippingCity) {
            this.formData.wholeSaleInformation.city = account.shippingCity;
            
        }
    
        if (account.shippingCountry) {
            this.formData.wholeSaleInformation.country = account.shippingCountry;
           
        }
    
        if (account.shippingState) {
            this.formData.wholeSaleInformation.province = account.shippingState;
            
        }
    
        if (account.shippingPostalCode) {
            this.formData.wholeSaleInformation.postalCode = account.shippingPostalCode;
           
        }
        console.log('this.formData>>2', JSON.stringify(this.formData));
        if(this.formData.wholeSaleInformation.account.id){
            this.handleAddWholeSaleFavoritesButton(this.formData.wholeSaleInformation.account.id);
        }
        
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
            this.formData.wholeSaleInformation.Physician.id = contact.id;
            //this.editedData.wholeSaleInformation.Physician.id = contact.id;
        }
        if(contact.firstName) {
            this.formData.wholeSaleInformation.Physician.firstName = contact.firstName;
            this.template.querySelector('lightning-input[data-name="wholeSaleInformation.Physician.firstName"]').value = contact.firstName;
            //this.editedData.wholeSaleInformation.Physician.firstName = contact.firstName;
        }
        if(contact.lastName) {
            this.formData.wholeSaleInformation.Physician.lastName = contact.lastName;
            this.template.querySelector('lightning-input[data-name="wholeSaleInformation.Physician.lastName"]').value = contact.lastName;
            //this.editedData.wholeSaleInformation.Physician.lastName = contact.lastName;
        }
        if(contact.npi){
            this.formData.wholeSaleInformation.Physician.npi = contact.npi;
            this.template.querySelector('lightning-input[data-name="wholeSaleInformation.Physician.npi"]').value = contact.npi;
            //this.editedData.wholeSaleInformation.Physician.npi = contact.npi;
        }

        console.log('this.formData>>3', JSON.stringify(this.formData));
        console.log('this.editeddate>>3', JSON.stringify(this.editedData));
        if(this.formData.wholeSaleInformation.Physician.id){
            console.log('inside cond check physician');
            this.handleAddPhysicianFavoritesButton(this.formData.wholeSaleInformation.Physician.id);
        }
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

    getAccountWholeSaleRecordtype(){
        getAccountWholesaleecordValue().then((result) => { 
            console.log('result', result);
            this.wholesaleAccountRecordtypeId = result 
            console.log('wholesaleAccountRecordtypeId', this.wholesaleAccountRecordtypeId);
        }).catch((error) => {showReduceErrors(this, error); });
        
    }

    showFileUploadModal()  {
        this.isShowFileUploadModal = true;
    }
    hideFileUploadModal() {
        this.isShowFileUploadModal = false;
    }

    get myRecordId() {
        return this.formData.id;
    }

    openfileUpload(event) {
        let orderRecordId;
        if(this.recordId ==undefined && this.recordId ==null){
            orderRecordId =null;
        }else orderRecordId =this.recordId;
        console.log('orderRecordId', orderRecordId);
        showLoader(this);
        if (event.target.files.length > 0) {
            for (let i = 0; i < event.target.files.length; i++) {
                const file = event.target.files[i];
                const reader = new FileReader();
                reader.onload = () => {
                    let base64 = reader.result.split(',')[1];
                    uploadFile({ base64, filename:  file.name, recordId: orderRecordId, docType: "PO", docTypeOther: null }).then(result=>{
                        this.formData.wholeSaleInformation.contentRecordId = result;
                        showSuccess(this, 'Success', "File uploaded successfully");
                        // this.loadFiles().catch(e => console.log(e));
                        
                    }).catch(e => {
                        showError(this, 'Error', `${e}`);
                    });
                };
                
                reader.readAsDataURL(file);
            }
              this.hideFileUploadModal();
              hideLoader(this);
        }
    }

    handleAddressChange(event) {
       
        if (!this.editedData.wholeSaleInformation) {
            this.editedData.wholeSaleInformation = {};
        }
        if (!this.editedData.wholeSaleInformation.account) {
            this.editedData.wholeSaleInformation.account = {};
        }
    
       
        this.editedData.wholeSaleInformation.street = event.target.street 
        this.editedData.wholeSaleInformation.city = event.target.city 
        this.editedData.wholeSaleInformation.province = event.target.province 
        this.editedData.wholeSaleInformation.country = event.target.country 
        this.editedData.wholeSaleInformation.postalCode = event.target.postalCode 
    
        console.log('this.editedData', JSON.stringify(this.editedData));
    }

    handlePOUploadChange(){

    }

}