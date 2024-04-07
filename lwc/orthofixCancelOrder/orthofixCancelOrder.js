import {api, track, wire, LightningElement} from 'lwc';
import LightningConfirm from 'lightning/confirm';
import getOrder from "@salesforce/apex/OrderController.getOrder";
import saveOrder from "@salesforce/apex/OrderController.saveOrder";
import {showSuccess, showError, showReduceErrors, showLoader, hideLoader} from 'c/orthofixNotificationUtility';
import Orthofix_checkmarkicon from "@salesforce/resourceUrl/Orthofix_checkmarkicon";
import { CloseActionScreenEvent } from 'lightning/actions';


export default class OrthofixCancelOrder extends LightningElement {
    @api recordId;
    @api formData;
    cancelationReason = [];
    @track recordTypeOptions;
    @track selectedRecordType;
    connectedCallback() {
        console.log('Leaving this here to prove that recordId is not populated ' +
            'quickly enough to put logic in the connectedCallback:  ', this.recordId);
    }

    renderedCallback() {
        // you will see this logging before the recordId is populated, and a second time when it is populated
        console.log('renderedCallback called with recordId ', this.recordId);
    }

    getOrder(){
        console.log("hey from getorder");
        console.log("this.recordId    " +JSON.stringify(this.recordId));
        getOrder({id: this.recordId})
        .then((result) => {
            let orderData = JSON.parse(JSON.stringify(result));
            console.log("canccelation reaons and "+JSON.stringify(orderData))
            if (orderData.CancellationReason && orderData.CancellationReason.values) {
                this.cancelationReason = orderData.CancellationReason.values.map(option => ({
                    label: option.label,
                    value: option.value,
                }));

                console.log('Cancellation Reason is ' + JSON.stringify(this.cancelationReason));
            }
        })
        .catch((error) => {
            console.error('Error fetching order data: ' + error);
            // Handle errors appropriately (show an error message, log, etc.)
        });
    }

    handleSave(){
        this.showheader=false;
        let validaton=false;
            validaton= this.validationCheck();
        if(validaton===false){
            this.save(true);
            console.log('calling save method');
            
        }
        
        
    }
    save(showSuccessMsg){
        console.log('inside save method');
            showLoader(this);
            console.log('inside save method log 2');
            let CancenlationReson = {
                id: this.Order.id,
                status: "cancel",
                CancellationReason: CancellationReason,
            };
    
            // Save Patient Information
            saveOrder({order: CancenlationReson})

                .then((result) => {
                
                })
            

            
    }
    handleChange(event) {
        this.selectedRecordType = event.detail.value;
        console.log('selected recordtype', this.selectedRecordType);
        // console.log(' this.selectedRecordTypeLabel',  this.selectedRecordTypeLabel);
        const selectedOption = this.recordTypeOptions.find(recordTypeOption => recordTypeOption.value === this.selectedRecordType);
        if (selectedOption) {
            console.log('selectedOption.label', selectedOption.value);
            //  console.log('selectedOption.label', selectedOption.recordTypeName);
            //   console.log('selectedOption.label', selectedOption.recordTypeDeveloperName);
            // this.recordTypeLabel = selectedOption.label;
            // this.recordTypeDeveloperName = selectedOption.recordTypeDeveloperName;
        }
        // console.log('this.recordTypeLabel>>' ,this.recordTypeLabel);
       
    }

    handleCancel() {
       
        this.dispatchEvent(new CustomEvent('cancel'));
    }

    
}