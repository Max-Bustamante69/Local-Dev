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
    @track IncorrectPHI;


    handleReasonChange(event) {
        this.selectedReason = event.detail.value;
        console.log(JSON.stringify(this.selectedReason));
        this.showContactPhysician = this.selectedReason === 'Incorrect PHI';
        this.showOtherReason = this.selectedReason === 'Other';

    } 

    handleOtherReason(event){
        this.otherReason =  event.detail.value;
    }
    contactPhysician(event){
        console.log('contactPhysician');
        console.log("event.detail.value  " +JSON.stringify(event.target.checked));
        this.IncorrectPHI = event.target.checked;
    }

    handleSubmit(event) {
        if(this.selectedReason){
            event.preventDefault();
        showLoader(this);
        if  (this.selectedReason === 'Incorrect PHI'){
            this.otherReason = null;
        }
        else if (this.selectedReason === 'Other'){
            this.IncorrectPHI = null;
        }else{
            this.otherReason = null;
            this.IncorrectPHI = null;
        }

        
        this.save(true);
        //this.dispatchEvent(new CloseActionScreenEvent());
        console.log('calling save method');
        }else {
            showError(this, 'Validation Error', 'Select Reason for cancellation');
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