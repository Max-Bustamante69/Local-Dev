import {api, LightningElement, track} from 'lwc';

export default class OrthofixOrderFormDiagnosisItem extends LightningElement {

    @api title;
    @api other = false;
    @api picklistOptions;
    @api formData;
    @api physioAccel = false;
    @api otherPhysio;
    @api requiredFields;
    @api showGrade;
    @api showXRayDates = false;
    @api disableForm;
    @api clinicalDisableForm;
    @api isRequired;

    diagnosisItem = {};

    @track toggleChecked = false;
    @track disabled = true;

    connectedCallback() {
        if(this.formData && this.formData.diagnosisMap && this.formData.diagnosisMap[this.title]){
            this.diagnosisItem = JSON.parse(JSON.stringify(this.formData.diagnosisMap[this.title]));
            this.toggleChecked = true;
             this.disabled = false;
        }
        this.diagnosisItem.Type__c = this.title;
    }

    handleInputChange(event){
        let name =  event.target.name;
        let value = event.target.value;
        this.diagnosisItem[name] = value;
        this.diagnosisItem.active = true;
        this.diagnosisItem.Type__c = this.title;
        this.sendEventData();
    }

    changeToggle(event){
        if(this.toggleChecked){
            this.toggleChecked = false;
            this.diagnosisItem.active = false;
            this.diagnosisItem.Type__c = this.title;
        }else{
            this.toggleChecked = true;
            this.diagnosisItem.active = true;
            this.diagnosisItem.Type__c = this.title;
        }
        this.disabled = !this.toggleChecked;
        this.sendEventData();
    }

    get isShowCheckbox(){
        return this.showCheckbox=='true';
    }

    sendEventData(){
        console.log(this.title, JSON.stringify(this.diagnosisItem));
        this.dispatchEvent(new CustomEvent(
            'inputchangediagnosis', {
                bubbles : true,
                composed : true,
                detail: {
                    diagnosisType: this.title,
                    diagnosisItem: this.diagnosisItem
                }
            }));
    }

}