/**
 * @description       : 
 * @author            : manish.tyagi@argano.com
 * @group             : 
 * @last modified on  : 05-06-2024
 * @last modified by  : Lokesh Kesava | lokesh.kesava@argano.com
**/
import { LightningElement, api, track, wire } from 'lwc';
import { resolution } from "c/orderUtils";
import { getRecord, getFieldValue, updateRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import NAME_FIELD from "@salesforce/schema/Order.Name";
import ProductType_FIELD from "@salesforce/schema/Order.ProductType__c";
import Asset_FIELD from "@salesforce/schema/Order.Asset__c";
import label1 from '@salesforce/label/c.AOB_Label';
import label2 from '@salesforce/label/c.ABN_Label';
import label3 from '@salesforce/label/c.Bone_Growth_Stimulator_Checklist_Label';
import cervicalStimAOBFormURL from '@salesforce/label/c.CervicalStim_AOB_Form_Titan_URL';
import physioStimAOBFormURL from '@salesforce/label/c.PhysioStim_Form_Titan_URL';
import accelStimAOBFormURL from '@salesforce/label/c.AccelStim_Form_Titan_URL';
import spinalStimAOBFormURL from '@salesforce/label/c.SpinalStim_AOB_Form_Titan_URL';
import physioStimABNFormURL from '@salesforce/label/c.PhysioStim_ABN_Form_Titan_URL';
import accelStimABNFormURL from '@salesforce/label/c.AccelStim_ABN_Form_Titan_URL';
import spinalStimABNFormURL from '@salesforce/label/c.SpinalStim_ABN_Form_Titan_URL';
import cervicalStimABNFormURL from '@salesforce/label/c.CervicalStim_ABN_Form_Titan_URL';
import bgscFormURL from '@salesforce/label/c.BONE_GROWTH_CheckList_Form_Titan_URL';
import uploadFile from "@salesforce/apex/FileUploaderController.uploadFile";
import {showSuccess, showError, showReduceErrors, showLoader, hideLoader} from 'c/orthofixNotificationUtility';

export default class OrthofixOrderFormTitanContainer extends LightningElement {

    label = {
        label1,
        label2,
        label3,
        cervicalStimAOBFormURL,
        physioStimAOBFormURL,
        accelStimAOBFormURL,
        spinalStimAOBFormURL,
        physioStimABNFormURL,
        accelStimABNFormURL,
        spinalStimABNFormURL,
        cervicalStimABNFormURL,
        bgscFormURL
    };
    @api recordId;
    @track customCSSFont;
    @track isShowFileUploadModal = false;

    @wire(getRecord, {
        recordId: "$recordId",
        fields: [NAME_FIELD, ProductType_FIELD, Asset_FIELD],
    })
    order;

    get getAOBSrcUrl() {
        var productType = getFieldValue(this.order.data, ProductType_FIELD);
        if(productType !== undefined && productType != '' && productType != 'undefined'){
            var splittedProductType = productType.split(';')[0];
            switch(splittedProductType) {
            case "PhysioStim":
                return this.label.physioStimAOBFormURL;
                break;
            case "AccelStim":
                return this.label.accelStimAOBFormURL;
                break;
            case "SpinalStim":
                return this.label.spinalStimAOBFormURL;
                break;
            default:
                return this.label.cervicalStimAOBFormURL;
            }
        }
    }

    get getAOBrecordId(){
        return this.recordId;
    }

    get disableAssetLookup() {
        console.log('-----------', JSON.stringify(this.order?.data));
        console.log('-----------', JSON.stringify(!!this.order?.data?.fields?.Asset__c?.value));
        return !!this.order?.data?.fields?.Asset__c?.value;
    }

    get getselectedAssetId(){
        if(this.order.data === undefined){
        }else{
            return this.order.data.fields.Asset__c.value;
        }
    }
    
    get getABNSrcUrl() {
        var productType = getFieldValue(this.order.data, ProductType_FIELD);
        if(productType !== undefined && productType != '' && productType != 'undefined'){
            var splittedProductType = productType.split(';')[0];
            switch(splittedProductType) {
            case "PhysioStim":
                return this.label.physioStimABNFormURL + this.recordId;
                break;
            case "AccelStim":
                return this.label.accelStimABNFormURL + this.recordId;
                break;
            case "SpinalStim":
                return this.label.spinalStimABNFormURL + this.recordId;
                break;
            default:
                return this.label.cervicalStimABNFormURL + this.recordId;
            }
        }
    }
    connectedCallback(){
        this.customCSSFont = resolution('slds-truncate slds-m-top_x-small slds-m-bottom_x-small customfont slds-text-heading_medium','slds-truncate slds-m-top_x-small slds-m-bottom_x-small customfont slds-text-heading_medium','slds-truncate slds-m-top_x-small slds-m-bottom_x-small custommobilefont');
        this.bgscSrcUrl = this.label.bgscFormURL + this.recordId;
    }

    handleValueSelectedOnAsset(event){
        try {
            let selectedAsset = event.detail;            
            this.handleUpdateOrder(selectedAsset.id);
        }catch (e) {
            console.log('Error', JSON.stringify(e));
        }
    }

    handleUpdateOrder(selectedAssetId){
        let record = {
            fields: {
                Id: this.recordId,
                Asset__c: selectedAssetId
            }
        }
        try{
            updateRecord(record);
        }catch (error) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error updating record',
                message: error.message.body,
                variant: 'error',   
            })
        );
        } 
    }

    showFileUploadModal()  {
        this.isShowFileUploadModal = true;
    }
    hideFileUploadModal() {
        this.isShowFileUploadModal = false;
    }

    
    openfileUpload(event) {
        showLoader(this);
        if (event.target.files.length > 0) {
            for (let i = 0; i < event.target.files.length; i++) {
                const file = event.target.files[i];
                const reader = new FileReader();
                reader.onload = () => {
                    let base64 = reader.result.split(',')[1];
                    uploadFile({ base64, filename:  file.name, recordId: this.recordId, docType: null, docTypeOther: null}).then(result=>{
                        showSuccess(this, 'Success', "File uploaded successfully");
                        //this.loadFiles().catch(e => console.log(e));
                        
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

    handleCustomEvent(event){
        const assetid = event.detail;
        this.handleUpdateOrder(assetid);
    }
}