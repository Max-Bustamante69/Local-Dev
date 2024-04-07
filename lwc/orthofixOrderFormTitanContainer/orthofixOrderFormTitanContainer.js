/**
 * @description       : 
 * @author            : manish.tyagi@argano.com
 * @group             : 
 * @last modified on  : 04-03-2024
 * @last modified by  : manish.tyagi@argano.com
**/
import { LightningElement, api, track, wire } from 'lwc';
import { resolution } from "c/orderUtils";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import NAME_FIELD from "@salesforce/schema/Order.Name";
import ProductType_FIELD from "@salesforce/schema/Order.ProductType__c";
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

    @wire(getRecord, {
        recordId: "$recordId",
        fields: [NAME_FIELD, ProductType_FIELD],
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
}