import { api, LightningElement, track } from 'lwc';
import { showLoader, hideLoader } from 'c/orthofixNotificationUtility';
import getFiles from "@salesforce/apex/FileUploaderController.getFiles";


export default class OrthofixOrderFormDocumentsItem extends LightningElement {

    @api formData;
    @api picklistOptions;
    @api requiredFields;
    @track orderFiles = [];

    get myRecordId() {
        return this.formData.id;
    }

    connectedCallback() {
        this.loadFiles().catch(e => console.log(e));
    }

    handleInputChange(event) {
        let value = event.target.value;
        console.log('handleInputChange ', value);
    }

    async loadFiles() {
        try {
            showLoader(this);
            this.orderFiles = await getFiles({ recordId: this.myRecordId });
            console.log(JSON.stringify(this.orderFiles));
        } catch (error) {
            console.error('Error in loadFiles for OrthofixOrderFormDocumentsItem', error);
        }
        finally {
            hideLoader(this);
        }


    }

}