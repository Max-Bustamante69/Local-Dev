/**
 * @description       : Genric lookup component used for account, contact, zupcode and asset object in lwc components
 * @author            : lokesh.kesava@argano.com
 * @group             : 
 * @last modified on  : 05-20-2024
 * @last modified by  : Lokesh Kesava | lokesh.kesava@argano.com
**/

import { LightningElement, api } from 'lwc';
import fetchRecords from '@salesforce/apex/orthofixLookupLwcController.fetchRecords';
const DELAY = 300;

export default class OrthofixGenericLookupComp extends LightningElement {
    @api helpText = "search lookup";
    @api label = "Parent Account";
    @api required;
    @api selectedIconName = "standard:account";
    @api objectLabel = "Account";
    recordsList = [];
    selectedRecordName;
    selectedRecord = {};

    @api objectApiName = "Account";
    @api fieldApiName = "Name";
    @api otherFieldApiName = "Industry";
    @api searchString = "";
    @api selectedRecordId = "";
    @api recordTypeId="";
    @api disabledInput;
    @api selectedShippingStreet;
    @api selectedShippingCity;
    @api selectedShippingState;
    @api selectedShippingPostalCode;
    @api selectedShippingCountry;
    @api selectedPhone;      
    @api parentRecordId;
    @api parentFieldApiName;
    @api selectedCity;
    @api selectedCounty;
    @api selectedCountry;
    @api selectedStateCode;
    @api selectedOracleId;
    @api selectedAddress2;
    preventClosingOfSerachPanel = false;
    @api physicianContact;

    get methodInput() {
        return {
            objectApiName: this.objectApiName,
            fieldApiName: this.fieldApiName,
            otherFieldApiName: this.otherFieldApiName,
            searchString: this.searchString,
            selectedRecordId: this.selectedRecordId,
            recordTypeId : this.recordTypeId,
            parentRecordId: this.parentRecordId,
            parentFieldApiName: this.parentFieldApiName,
            physicianContact: this.physicianContact
        };
    }

    get showRecentRecords() {
        if (!this.recordsList) {
            return false;
        }
        return this.recordsList.length > 0;
    }

    //getting the default selected record
    connectedCallback() {
        console.log('this.selectedRecordId', this.selectedRecordId);
        if (this.selectedRecordId) {
            this.fetchSobjectRecords(true);
        }
    }

    //call the apex method
    fetchSobjectRecords(loadEvent) {
        fetchRecords({
            inputWrapper: this.methodInput
        }).then(result => {
            console.log('result', JSON.stringify(result));
            if (loadEvent && result) {
                console.log('log 1');
                this.selectedRecordName = result[0].mainField;
                this.selectedShippingStreet = result[0].shippingStreet;
                this.selectedShippingCity = result[0].shippingCity;
                this.selectedShippingState = result[0].shippingState;
                this.selectedShippingPostalCode = result[0].shippingPostalCode;
                this.selectedShippingCountry = result[0].shippingCountry;
                this.selectedPhone = result[0].phone;
                this.selectedCity = result[0].city;
                this.selectedCounty = result[0].county;
                this.selectedStateCode = result[0].statecode;
                this.selectedCountry = result[0].country;
                this.selectedOracleId = result[0].oracleId;
                this.selectedAddress2 = result[0].address2;
            } else if (result) {
                console.log('log 2 result', JSON.stringify(result));
                console.log('log 2');
                this.recordsList = JSON.parse(JSON.stringify(result));
                console.log('this.recordsList>>',this.recordsList);
            } else {
                console.log('log 3 result', JSON.stringify(result));
                console.log('log 3');
                this.recordsList = [];
            }
        }).catch(error => {
            console.log(error);
        })
    }

    get isValueSelected() {
        return this.selectedRecordId;
    }

    //handler for calling apex when user change the value in lookup
    handleChange(event) {
        this.searchString = event.target.value;
        this.fetchSobjectRecords(false);
    }

    //handler for clicking outside the selection panel
    handleBlur() {
        this.recordsList = [];
        this.preventClosingOfSerachPanel = false;
    }

    //handle the click inside the search panel to prevent it getting closed
    handleDivClick() {
        this.preventClosingOfSerachPanel = true;
    }

    //handler for deselection of the selected item
    handleCommit() {
        this.selectedRecordId = "";
        this.selectedRecordName = "";
    
        if ((this.objectApiName == 'Asset' || this.objectApiName == 'Address__c' || this.objectApiName == 'PhoneNumber__c') && this.selectedRecordId == "") {
            console.log('selectedRecordId>>> ', this.selectedRecordId);
            console.log('objectApiName>>> ', this.objectApiName);
            const unselectEvent = new CustomEvent('unselectevent', {
                detail: this.selectedRecordId
            });
            this.dispatchEvent(unselectEvent);
        }
    }

    //handler for selection of records from lookup result list
    handleSelect(event) {
        if(this.objectApiName === 'Account'){
            var objId = event.currentTarget.dataset.id; 
            this.selectedRecord = this.recordsList.find(data => data.id === objId);
            this.selectedRecordId =  this.selectedRecord.id;
            this.selectedRecordName =  this.selectedRecord.mainField;
            this.recordsList = [];
        // Creates the event
        const selectedEvent = new CustomEvent('valueselected', {
            detail: this.selectedRecord
        });
        //dispatching the custom event
        this.dispatchEvent(selectedEvent);
        }else if(this.objectApiName === 'ZipCode__c'){
            console.log('inside Zip code value');
            var objId = event.currentTarget.dataset.id; 
            this.selectedRecord = this.recordsList.find(data => data.id === objId);
            this.selectedRecordId =  this.selectedRecord.id;
            this.selectedRecordName =  this.selectedRecord.mainField;
            this.recordsList = [];
        // Creates the event
        const selectedEvent = new CustomEvent('valueselected', {
            detail: this.selectedRecord
        });
        //dispatching the custom event
        this.dispatchEvent(selectedEvent);
        }else if(this.objectApiName === 'Address__c'){
            console.log('inside Address value');
            var objId = event.currentTarget.dataset.id; 
            this.selectedRecord = this.recordsList.find(data => data.id === objId);
            this.selectedRecordId =  this.selectedRecord.id;
            this.selectedRecordName =  this.selectedRecord.mainField;
            this.recordsList = [];
        // Creates the event
        const selectedEvent = new CustomEvent('valueselected', {
            detail: this.selectedRecord
        });
        //dispatching the custom event
        this.dispatchEvent(selectedEvent);
        }
        else if(this.objectApiName === 'PhoneNumber__c'){
            console.log('inside phonenumber value');
            var objId = event.currentTarget.dataset.id; 
            this.selectedRecord = this.recordsList.find(data => data.id === objId);
            this.selectedRecordId =  this.selectedRecord.id;
            this.selectedRecordName =  this.selectedRecord.mainField;
            this.recordsList = [];
        // Creates the event
        const selectedEvent = new CustomEvent('valueselected', {
            detail: this.selectedRecord
        });
        //dispatching the custom event
        this.dispatchEvent(selectedEvent);
        }
        else{
            console.log('inside other object');
            let selectedRecord = {
                mainField: event.currentTarget.dataset.mainfield,
                subField: event.currentTarget.dataset.subfield,
                id: event.currentTarget.dataset.id
            };
            
            this.selectedRecordId = selectedRecord.id;
            this.selectedRecordName = selectedRecord.mainField;
            this.recordsList = [];
            // Creates the event
            const selectedEvent = new CustomEvent('valueselected', {
                detail: selectedRecord
            });
            //dispatching the custom event
            this.dispatchEvent(selectedEvent);
        }
        
    }
    
    //to close the search panel when clicked outside of search input
    handleInputBlur(event) {
        // Debouncing this method: Do not actually invoke the Apex call as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex method calls.
        window.clearTimeout(this.delayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayTimeout = setTimeout(() => {
            if (!this.preventClosingOfSerachPanel) {
                this.recordsList = [];
            }
            this.preventClosingOfSerachPanel = false;
        }, DELAY);
    }

    renderedCallback() {
       
        console.log('rendered recordid>>', this.selectedRecordId);
        if (this.selectedRecordId) {
            this.fetchSobjectRecords(true);
        }
    }

}