/**
 * @description       : 
 * @author            : manish.tyagi@argano.com
 * @group             : 
 * @last modified on  : 04-25-2024
 * @last modified by  : Lokesh Kesava | lokesh.kesava@argano.com
**/
import {api, track, LightningElement} from 'lwc';
import physioStimLOMNFormURL from '@salesforce/label/c.PhysioStim_LOMN_Form_Titan_URL';
import accelStimLOMNFormURL from '@salesforce/label/c.AccelStim_LOMN_Form_Titan_URL';
import spinalStimLOMNFormURL from '@salesforce/label/c.SpinalStim_LOMN_Form_Titan_URL';
import cervicalStimLOMNFormURL from '@salesforce/label/c.CervicalStim_LOMN_Form_Titan_URL';

export default class OrthofixOrderFormClinicalInformation extends LightningElement {

    label = {
        physioStimLOMNFormURL,
        accelStimLOMNFormURL,
        spinalStimLOMNFormURL,
        cervicalStimLOMNFormURL
    };

    @api formData;
    @api clinicalDisableForm;
    @api editedData;
    @api picklistOptions;
    @api requiredFields;
    @api productType;
    @track isShowModal = false;
    surgeryTypeHeaderText = 'Revision Information';
    @track
    options = [];


    handleCheckboxChange(event){
        let isPrescriptionChecked = event.detail;
        console.log('inside clinical checkbox change');
        console.log('  this.isPrescriptionChecked >>'  , isPrescriptionChecked);
        this.dispatchEvent(new CustomEvent('checkboxchange', { detail: isPrescriptionChecked}));

    }

    handleFilesCheck(event){
        let isFileExist = event.detail;
        console.log('isFileExist in clinical', isFileExist);
        this.dispatchEvent(new CustomEvent('fileexist', { detail: isFileExist}));
    }
    @api
    checkOrderFiles(){
        const documentsComp = this.template.querySelector('c-orthofix-order-form-documents-item-desktop');
        if (documentsComp) {
                console.log('inside documentsComp');
                documentsComp.checkOrderFiles();
        }
    }

   

    get showPhySioAccelRelatedFields() {
        return (this.formData.patientInformation.productType === 'AccelStim' || this.formData.patientInformation.productType === 'PhysioStim')
    }

    get showAccelFields() {
        return this.formData.patientInformation.productType === 'AccelStim'
    }

    get showPhysioFields() {
        return this.formData.patientInformation.productType === 'PhysioStim'
    }

    get showSpinalCervicalStimRelatedFields() {
        return !(this.formData.patientInformation.productType === 'AccelStim' || this.formData.patientInformation.productType === 'PhysioStim')
    }

    get formTitanUrl() {
        var productType = this.formData.patientInformation.productType;
        if(productType !== undefined && productType != '' && productType != 'undefined'){
            var splittedProductType = productType.split(';')[0];
            switch(splittedProductType) {
            case "PhysioStim":
                return this.label.physioStimLOMNFormURL + this.formData.id;
                break;
            case "AccelStim":
                return this.label.accelStimLOMNFormURL + this.formData.id;
                break;
            case "SpinalStim":
                return this.label.spinalStimLOMNFormURL + this.formData.id;
                break;
            default:
                return this.label.cervicalStimLOMNFormURL + this.formData.id;
            }
        }
    }

    handleInputChange(event){
        let name = event.target.name;
        console.log("name", name);
        console.log("targetValue", event.target.value);
        console.log("targetChecked", event.target.checked);
        console.log("targetType", event.target.type);
        console.log("target", Object.keys(event.target));
        let value =event.target.type === 'checkbox' ? event.target.checked :  event.target.value;
        if (event.target.name === "surgeryType") {
            switch (event.target.value) {
                case "Revision":
                case "Failed Fusion":
                case "Multi-Level":
                case "Single-Level":
                case "Other":
                    this.surgeryTypeHeaderText = event.target.value + ' Information';
                    break;
                default:
                    break;
            }
        }
        if (name === 'patientInformation.productType') {
            this.showPhySioAccelRelatedFields = (value === 'AccelStim' || value === 'PhysioStim');
            this.showSpinalCervicalStimRelatedFields = !(value === 'AccelStim' || value === 'PhysioStim');
            console.log('showPhySioAccelRelatedFields', this.showPhySioAccelRelatedFields);
            console.log('showSpinalCervicalStimRelatedFields', this.showSpinalCervicalStimRelatedFields);
        }

        this.dispatchEvent(new CustomEvent('inputchange', {bubbles : true, composed : true, detail: {fieldName: name, value: value}}));
    }

    get revisionSurgerySelected() {
        return this.showSpinalCervicalStimRelatedFields && this.editedData.surgeryType === 'Revision';
    }
    get otherSurgerySelected() {
        return this.showSpinalCervicalStimRelatedFields && this.editedData.surgeryType !== 'Revision';
    }


    generate() {
        this.isShowModal = true;
    }

    hideModal() {
        this.isShowModal = false;
    }
}