import { LightningElement, api, track } from 'lwc';
import { getObjectInfo, getRecord } from 'lightning/uiRecordApi';




export default class OrthofixOrderTypeSelection extends LightningElement {
    @track selectedRecordType;
    @track recordTypeLabel;
    @track recordTypeDeveloperName;

    @api recordTypeOptions; 

    handleRecordTypeChange(event) {
        this.selectedRecordType = event.detail.value;
        console.log('selected recordtype', this.selectedRecordType);
        console.log(' this.selectedRecordTypeLabel',  this.selectedRecordTypeLabel);
        const selectedOption = this.recordTypeOptions.find(recordTypeOption => recordTypeOption.value === this.selectedRecordType);
        if (selectedOption) {
            console.log('selectedOption.label', selectedOption.value);
             console.log('selectedOption.label', selectedOption.recordTypeName);
              console.log('selectedOption.label', selectedOption.recordTypeDeveloperName);
            this.recordTypeLabel = selectedOption.label;
            this.recordTypeDeveloperName = selectedOption.recordTypeDeveloperName;
        }
        console.log('this.recordTypeLabel>>' ,this.recordTypeLabel);
       
    }

    handleCancel() {
       
        this.dispatchEvent(new CustomEvent('cancel'));
    }

    handleNext() {
       
        //this.dispatchEvent(new CustomEvent('next', { detail: this.selectedRecordType }));

         const customEvent = new CustomEvent('next', { detail: {
                                                recordTypename: this.recordTypeLabel,
                                                recordTypeId:this.selectedRecordType,
                                                recordTypeDeveloperName:this.recordTypeDeveloperName
                                            } 
                                        });
        this.dispatchEvent(customEvent);
    }
}