import {api, track, LightningElement} from 'lwc';
import LightningConfirm from 'lightning/confirm';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';
import saveOrder from "@salesforce/apex/OrderController.saveOrder";
import getOrder from "@salesforce/apex/OrderController.getOrder";
import {showSuccess, showError, showReduceErrors, showLoader, hideLoader} from 'c/orthofixNotificationUtility';

export default class CancelOrderModal extends LightningElement {
    @api recordId;
    @track selectedReason;
    @track otherReason;
    @track showContactPhysician = false;
    @track showOtherReason = false;
    @track IncorrectPHI = false;

    @track orderData = {};

    handleReasonChange(event) {
        this.selectedReason = event.detail.value;
        this.orderData.selectedReason = this.selectedReason;
        this.orderData.IncorrectPHI = false;
        this.orderData.otherReason = null;
        this.showContactPhysician = this.orderData.selectedReason === 'Incorrect PHI';
        this.showOtherReason = this.orderData.selectedReason === 'Other';

    } 

    handleOtherReason(event){
        this.otherReason =  event.detail.value;
        this.orderData.otherReason = this.otherReason;
    }
    contactPhysician(event){
        console.log('contactPhysician');
        console.log("event.detail.value  " +JSON.stringify(event.target.checked));
        this.IncorrectPHI = event.target.checked;
        this.orderData.IncorrectPHI =  this.IncorrectPHI;
    }

    areAllRequiredFieldsFilled() {
      
        let formData = this.orderData; 
        const requiredFields = [
            formData.selectedReason,

        ];

        if (formData.selectedReason === "Incorrect PHI") {
            requiredFields.push(formData.IncorrectPHI);
        }
        
        if (formData.selectedReason === "Other") {
            requiredFields.push(formData.otherReason);
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

    handleSubmit(event) {
        event.preventDefault();
        
         console.log('OrderData', JSON.stringify(this.orderData));
         if (this.areAllRequiredFieldsFilled()) {
            this.save(true);
            console.log('calling save method');
         }else{
            showError(this, 'Validation Error', 'Please fill in required fields');
         }
    }

    save(showSuccessMsg){
        showLoader(this);
        console.log('inside save method log 2');
        let CancenlationReson = {
            id: this.recordId,
            Status: "Canceled",
            IncorrectPHI: this.IncorrectPHI,
            CancellationReason: this.selectedReason,
            Cancellation_Reason_Other: this.otherReason
    };

    console.log("consolation Reason  " +JSON.stringify(CancenlationReson));
    saveOrder({order: CancenlationReson})
        .then((result) => {
            this.dispatchEvent(new CloseActionScreenEvent());
            hideLoader(this);
            const evt = new ShowToastEvent ({
                    title: 'Success',
                    message: 'Order Cancelled Sucessfully',
                    variant: 'success'
                });
                this.dispatchEvent(evt);
           
                const selectEvent = new CustomEvent('hidemodal', {
                    detail: true
                    });
                    this.dispatchEvent(selectEvent);
                    

            
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
        })
        .catch((error) => {
            console.error('Error fetching order data: ' + error);
            // Handle errors appropriately (show an error message, log, etc.)
        });
               
    }
}