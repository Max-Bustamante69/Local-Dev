import {api, track, LightningElement} from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import orthofix_navigatetocontactlistview from '@salesforce/label/c.orthofix_navigatetocontactlistview';
import orthofix_navigatetoNPIRegistry from '@salesforce/label/c.orthofix_navigatetoNPIRegistry';
import {showSuccess, showError, showReduceErrors, showLoader, hideLoader} from 'c/orthofixNotificationUtility';


export default class OrthofixOrderFormPatientInformation extends NavigationMixin(LightningElement) {

    @api formData;
    @api picklistOptions;
    @api requiredFields;
    @api showAddFavoriteButton;
    sfdcbaseUrl;
    navigateToPhysicianListview;
    @api disableForm;
    zipCodeLookup;
    @track selectedPhysicianId = '';
    @track showAddressLookup = false;
    @api addressContactRectype;
    @api phoneContactRectype;


    label={
        navigatetocontactlistview: orthofix_navigatetocontactlistview,
        navigateToNPIRegistryUrl: orthofix_navigatetoNPIRegistry
    }

    connectedCallback() {
        this.sfdcbaseUrl = window.location.origin;
        this.navigateToPhysicianListview = this.sfdcbaseUrl + this.label.navigatetocontactlistview;
        console.log('testlog :'+JSON.stringify(this.formData));
    }

    prescriberDataFromLookup;

    get displaySalesRepField() {
        console.log('displaySalesRepField', this.picklistOptions.territoryManagers);
        return this.picklistOptions.territoryManagers !== null && this.picklistOptions.territoryManagers !== undefined && this.picklistOptions.territoryManagers !== '' && this.picklistOptions.territoryManagers.length > 0;
    }



    get prescriberAddress(){
        if (this.selectedAddRecord === null) {
            return null;
        }

        if(this.prescriberDataFromLookup){
            return {
                street:this.prescriberDataFromLookup.mainField,
                city:this.prescriberDataFromLookup.city,
                county:this.prescriberDataFromLookup.county,
                country:this.prescriberDataFromLookup.country,
                province:this.prescriberDataFromLookup.statecode,
                postalCode:this.prescriberDataFromLookup.postalCode,
                address2:this.prescriberDataFromLookup.address2,
            };
        }
        else if(this.formData && this.formData.patientInformation && this.formData.patientInformation.prescriber){
            return {
                street:this.formData.patientInformation.prescriber.street,
                city:this.formData.patientInformation.prescriber.city,
                country:this.formData.patientInformation.prescriber.country,
                county:this.formData.patientInformation.prescriber.county,
                province:this.formData.patientInformation.prescriber.province,
                postalCode:this.formData.patientInformation.prescriber.postalCode,
                address2:this.formData.patientInformation.prescriber.address2,
            };
        }
        else{
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
        let name = event.target.name;
        let value = event.target.value;

       
        this.dispatchEvent(new CustomEvent(
            'inputchange', {
                detail: {
                    fieldName: name,
                    value: value
                }
            }));
    }

    handleAddToFavoritesClick() {
        this.dispatchEvent(new CustomEvent(
            'inputchange', {
                detail: {
                    fieldName: 'patientInformation.prescriber.makeFavorite',
                    value: true
                }
            }));
        this.showAddFavoriteButton = false;
        showSuccess(this, 'Added as Favorite', 'Note : Favorite will be saved upon order save');
        
    }

    prescriberSelect(event) {
        try {
            console.log(JSON.parse(JSON.stringify(event.detail.selectedRecord) ));
            let contact = event.detail.selectedRecord;
            console.log('contact 2', JSON.stringify(contact));
            //this.prescriberDataFromLookup = contact;
            this.pupulatePrescriberData(contact);
            //this.formData = JSON.parse(JSON.stringify(this.formData));
            //this.formData.patientInformation.prescriber = JSON.parse(JSON.stringify(event.detail.selectedRecord) );
        }catch (e) {
            console.log('Error', JSON.stringify(e));
        }
    }

    primaryCarePhysicianSelect(event) {
        try {
            console.log(JSON.parse(JSON.stringify(event.detail.selectedRecord) ));
            let contact = event.detail.selectedRecord;
            console.log('contact 3', JSON.stringify(contact));
            //this.prescriberDataFromLookup = contact;
            this.pupulatePrimaryCarePhysicianData(contact);
            //this.formData = JSON.parse(JSON.stringify(this.formData));
            //this.formData.patientInformation.prescriber = JSON.parse(JSON.stringify(event.detail.selectedRecord) );
        }catch (e) {
            console.log('Error', JSON.stringify(e));
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
        this.pupulatePrescriberData(contact);
    }

    get formattedPhoneNumber() {
        if (this.formData.patientInformation.phone) {
            console.log('formData.patientInformation.phone', this.formData.patientInformation.phone);
            let phoneNumber = this.formData.patientInformation.phone.replace(/\D/g, ''); 
            console.log('phoneNumber', phoneNumber);
            if (phoneNumber) {
                if (phoneNumber.length > 3) {
                    phoneNumber = phoneNumber.slice(0, 3) + '-' + phoneNumber.slice(3);
                    if (phoneNumber.length > 7) {
                        phoneNumber = phoneNumber.slice(0, 7) + '-' + phoneNumber.slice(7, 11);
                    }
                }
            }
            return phoneNumber;
        }
    }

    get primaryCarePhoneNumber(){
        if (this.formData.patientInformation.primaryCarePhysician.phone) {
            console.log('formData.patientInformation.primaryCarePhysician.phone', this.formData.patientInformation.primaryCarePhysician.phone);
            let phoneNumber = this.formData.patientInformation.primaryCarePhysician.phone.replace(/\D/g, ''); 
            console.log('phoneNumber', phoneNumber);
            if (phoneNumber) {
                if (phoneNumber.length > 3) {
                    phoneNumber = phoneNumber.slice(0, 3) + '-' + phoneNumber.slice(3);
                    if (phoneNumber.length > 7) {
                        phoneNumber = phoneNumber.slice(0, 7) + '-' + phoneNumber.slice(7, 11);
                    }
                }
            }
            return phoneNumber;
        }

    }

    // get physicicanPhoneNumber(){
    //     if (this.formData.patientInformation.prescriber.phone) {
    //         console.log('formData.patientInformation.prescriber.phone', this.formData.patientInformation.prescriber.phone);
    //         let phoneNumber = this.formData.patientInformation.prescriber.phone.replace(/\D/g, ''); 
    //         console.log('phoneNumber', phoneNumber);
    //         if (phoneNumber) {
    //             if (phoneNumber.length > 3) {
    //                 phoneNumber = phoneNumber.slice(0, 3) + '-' + phoneNumber.slice(3);
    //                 if (phoneNumber.length > 7) {
    //                     phoneNumber = phoneNumber.slice(0, 7) + '-' + phoneNumber.slice(7, 11);
    //                 }
    //             }
    //         }
    //         return phoneNumber;
    //     }

    // }

    get emergencyPhoneNumber(){
        if (this.formData.patientInformation.emergencyContact.phone) {
            console.log('formData.patientInformation.emergencyContact.phone', this.formData.patientInformation.emergencyContact.phone);
            let phoneNumber = this.formData.patientInformation.emergencyContact.phone.replace(/\D/g, ''); 
            console.log('phoneNumber', phoneNumber);
            if (phoneNumber) {
                if (phoneNumber.length > 3) {
                    phoneNumber = phoneNumber.slice(0, 3) + '-' + phoneNumber.slice(3);
                    if (phoneNumber.length > 7) {
                        phoneNumber = phoneNumber.slice(0, 7) + '-' + phoneNumber.slice(7, 11);
                    }
                }
            }
            return phoneNumber;
        }

    }

    pupulatePrescriberData(contact){
        if(!contact){
            return;
        }
        if(contact.id){
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.prescriber.id", value: contact.id}}));
        }
        this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.prescriber.isFavorite", value: !!contact.isFavorite}}));
        if(contact.firstName){
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.prescriber.firstName", value: contact.firstName}}));
            this.template.querySelector('lightning-input[data-name="patientInformation.prescriber.firstName"]').value = contact.firstName;
        }
        if(contact.lastName){
            console.log('contact.lastName', contact.lastName);
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.prescriber.lastName", value: contact.lastName}}));
            this.template.querySelector('lightning-input[data-name="patientInformation.prescriber.lastName"]').value = contact.lastName;
        }
        // if(contact.phone){
        //     this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.prescriber.phone", value: contact.phone}}));
        //     this.template.querySelector('lightning-input[data-name="patientInformation.prescriber.phone"]').value = contact.phone;
        // }
        if(contact.npi){
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.prescriber.npi", value: contact.npi}}));
            this.template.querySelector('lightning-input[data-name="patientInformation.prescriber.npi"]').value = contact.npi;
        }
        if(contact.licence){
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.prescriber.licence", value: contact.licence}}));
            this.template.querySelector('lightning-input[data-name="patientInformation.prescriber.licence"]').value = contact.licence;
        }

        // if(contact.street){
        //     this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.prescriber.street", value: contact.street}}));
        // }
        // if(contact.city){
        //     this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.prescriber.city", value: contact.city}}));
        // }
        // if(contact.country){
        //     this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.prescriber.country", value: contact.country}}));
        // }
        // if(contact.province){
        //     this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.prescriber.province", value: contact.province}}));
        // }
        // if(contact.postalCode){
        //     this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.prescriber.postalCode", value: contact.postalCode}}));
        // }
        // if(contact.address2){
        //     this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.prescriber.address2", value: contact.address2}}));
        // }
        if(contact.id){
            this.getAddresses(contact.id);
        }
       

    }

    getAddresses(contactId){
        console.log(' this.selectedPhysicianId',  this.selectedPhysicianId);
        this.selectedPhysicianId = contactId;
        console.log(' this.selectedPhysicianId',  this.selectedPhysicianId);
        this.showAddressLookup = true;
        this.selectedPhysicianId = contactId;
        console.log(' this.selectedPhysicianId',  this.selectedPhysicianId);
    }
    



    pupulatePrimaryCarePhysicianData(contact){
        if(!contact){
            return;
        }
        if(contact.id){
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.primaryCarePhysician.id", value: contact.id}}));
        }
        if(contact.firstName || contact.lastName) {
            let fullName = contact.firstName + ' ' + contact.lastName;
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.primaryCarePhysician.name", value: fullName}}));
            this.template.querySelector('lightning-input[data-name="patientInformation.primaryCarePhysician.name"]').value = fullName;
        }
        if(contact.phone){
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.primaryCarePhysician.phone", value: contact.phone}}));
            this.template.querySelector('lightning-input[data-name="patientInformation.primaryCarePhysician.phone"]').value = contact.phone;
        }
        if(contact.npi){
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.primaryCarePhysician.npi", value: contact.npi}}));
            this.template.querySelector('lightning-input[data-name="patientInformation.primaryCarePhysician.npi"]').value = contact.npi;
        }
        if(contact.refferalcoordinator){
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.primaryCarePhysician.refferalcoordinator", value: contact.refferalcoordinator}}));
            this.template.querySelector('lightning-input[data-name="patientInformation.primaryCarePhysician.refferalcoordinator"]').value = contact.refferalcoordinator;
        }
        if(contact.fax){
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.primaryCarePhysician.fax", value: contact.fax}}));
            this.template.querySelector('lightning-input[data-name="patientInformation.primaryCarePhysician.fax"]').value = contact.fax;
        }


    }
    selectedAddRecord = '';
    makeAddressNull(event){
        let address = event.detail;
        console.log('address make null', address);
        this.selectedAddRecord = address;
        console.log('this.selectedAddRecord', this.selectedAddRecord);
    }

    handleValueSelectedOnZip(event){
        try {
            console.log(JSON.parse(JSON.stringify(event.detail)));
            let zipcode = event.detail;
            console.log('zipcode detail', JSON.stringify(zipcode));
            this.zipCodeLookup = zipcode;
            this.populateData(zipcode);
        }catch (e) {
            console.log('Error', JSON.stringify(e));
        }
    }

    handleValueSelectedOnAddress(event){
        try {
            console.log(JSON.parse(JSON.stringify(event.detail)));
            let address = event.detail;
            console.log('address detail', JSON.stringify(address));
            this.prescriberDataFromLookup = address;
            this.populateaddressData(address);
        }catch (e) {
            console.log('Error', JSON.stringify(e));
        }
    }

    handleValueSelectedOnPhone(event){
        try {
            console.log(JSON.parse(JSON.stringify(event.detail)));
            let phone = event.detail;
            console.log('phone detail', JSON.stringify(phone));
            this.prescriberPhoneDataFromLookup = phone;
            this.populatePhoneData(phone);
        }catch (e) {
            console.log('Error', JSON.stringify(e));
        }
    }

    prescriberPhoneDataFromLookup;
    get prescriberPhone(){
        console.log('this.formData.patientInformation.physicianPhone', this.formData.physicianPhone);
        if(this.prescriberPhoneDataFromLookup){
            return {
                phone:this.prescriberPhoneDataFromLookup.mainField
            };
        }
        else if(this.formData && this.formData.physicianPhone){
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.prescriber.phone", value: this.formData.physicianPhone}}));
            return {
                phone:this.formData.physicianPhone
            };
        }
        else{
            return {
                phone:null
            };
        }
    }

    populateData(zipcode){
        if (!zipcode) {
            console.log('inside no account');
            return;
        }
        console.log('zipcode' , JSON.stringify(zipcode));
        console.log('zipcode.id',zipcode.id);
        if (zipcode.mainField) {
            console.log('zipcode.mainField',zipcode.mainField);
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.postalCode", value: zipcode.mainField}}));
           
        }
        
        if (zipcode.city) {
            console.log('zipcode.city',zipcode.city);
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.city", value: zipcode.city}}));
            console.log('this.formData.patientInformation.city' , this.formData.patientInformation.city);
            this.template.querySelector('lightning-input[data-name="patientInformation.city"]').value = zipcode.city;
           
        }
        if (zipcode.statecode) {
            console.log('zipcode.statecode',zipcode.statecode);
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.province", value: zipcode.statecode}}));
            this.template.querySelector('lightning-input[data-name="patientInformation.state"]').value = zipcode.statecode;
           
        }
        if (zipcode.county) {
            console.log('zipcode.county',zipcode.county);
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.county", value: zipcode.county}}));
            this.template.querySelector('lightning-input[data-name="patientInformation.county"]').value = zipcode.county;
           
        }
        if (zipcode.country) {
            console.log('zipcode.country',zipcode.country);
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.country", value: zipcode.country}}));
            this.template.querySelector('lightning-input[data-name="patientInformation.country"]').value = zipcode.country;
           
        }




    }

    populatePhoneData(phone){
        if (!phone) {
            console.log('inside no phone');
            return;
        }

        if(phone.id){
            console.log('phone.id', phone.id);
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.prescriber.phoneId", value: phone.id}}));
        }

        if (phone.mainField) {
            console.log('phone.mainField',phone.mainField);
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.prescriber.phone", value: phone.mainField}}));
            
        }




    }

    populateaddressData(address){
        if (!address) {
            console.log('inside no address');
            return;
        }

        if(address.id){
            console.log('address.id', address.id);
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.prescriber.addressId", value: address.id}}));
        }

        if (address.mainField) {
            console.log('address.mainField',address.mainField);
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.prescriber.street", value: address.mainField}}));
            
        }
        
        if(address.city){
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.prescriber.city", value: address.city}}));
        }
        if(address.country){
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.prescriber.country", value: address.country}}));
        }
        if(address.statecode){
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.prescriber.province", value: address.statecode}}));
        }
        if(address.postalCode){
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.prescriber.postalCode", value: address.postalCode}}));
        }
        if(address.address2){
            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: "patientInformation.prescriber.address2", value: address.address2}}));
        }


    }


    handleAddressChange(event){
        let name = event.target.name;
        this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: name+'.street', value: event.target.street}}));
        this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: name+'.city', value: event.target.city}}));
        this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: name+'.province', value: event.target.province}}));
        this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: name+'.country', value: event.target.country}}));
        this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: name+'.postalCode', value: event.target.postalCode}}));
    }
}