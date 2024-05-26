import {api, LightningElement, track} from 'lwc';

export default class OrthofixOrderFormRiskFactorsItem extends LightningElement {

    @api formData;
    @api picklistOptions;
    @api clinicalDisableForm;
    @api requiredFields;
    @api disableForm;
    @api title;

    @track toggleChecked = false;
    disabled = true;

    riskFactorsItem = {};

    connectedCallback() {
        this.toggleChecked = (this.formData.previousTreatment || []).includes(this.title);
    }

    handleInputChange(event){
        let value = event.target.value;
        let name = event.target.name;
        this.dispatchEvent(new CustomEvent('inputchange', {bubbles : true, composed : true, detail: {fieldName: name, value: value}}));
    }

    get isFusion() {
        return this.title === 'Fusion';
    }

    get isFixation() {
        return this.title === 'Fixation';
    }

    get isRevision() {
        return this.title === 'Revision';
    }

    get isOther() {
        return this.title === 'Other';
    }


    changeToggle(event){
        let name = event.target.name;
        let value = event.target.value;
        if(this.toggleChecked){
            this.toggleChecked = false;
            this.disabled = true;
        }else{
            this.toggleChecked = true;
            this.disabled = false;
        }
        this.sendEventData();
    }

    sendEventData(){
        this.dispatchEvent(new CustomEvent(
            'multiselectchange', {
                bubbles : true,
                composed : true,
                detail: {
                    name: 'previousTreatment',
                    option: this.title,
                    value: this.toggleChecked
                }
            }));
    }
}