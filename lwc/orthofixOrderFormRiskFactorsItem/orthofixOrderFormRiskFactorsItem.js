import {api, LightningElement, track} from 'lwc';

export default class OrthofixOrderFormRiskFactorsItem extends LightningElement {

    @api formData;
    @api picklistOptions;
    @api requiredFields;
    @api showBmi = false;
    @api disableForm;
    @api title;
    @api other = false;
    @api clinicalDisableForm;

    @track toggleChecked = false;
    disabled = true;

    riskFactorsItem = {};

    connectedCallback() {
        if(this.formData && this.formData.riskFactors && this.formData.riskFactors.includes(this.title)){
            this.riskFactorsItem[this.title] = true;
            this.toggleChecked = true;
            this.disabled = false;
        }
        if(this.formData){
            this.riskFactorsOther = this.formData.riskFactorsOther;
        }
    }

    handleInputChange(event){
        let value = event.target.value;
        let name = event.target.name;
        this.dispatchEvent(new CustomEvent('inputchange', {bubbles : true, composed : true, detail: {fieldName: name, value: value}}));
    }

    changeToggle(event){
        let name = event.target.name;
        let value = event.target.value;
        if(this.toggleChecked){
            this.toggleChecked = false;
            this.disabled = true;
            this.riskFactorsItem[name] = false;
        }else{
            this.toggleChecked = true;
            this.disabled = false;
            this.riskFactorsItem[name] = true;
        }
        this.sendEventData();
    }

    sendEventData(){
        this.dispatchEvent(new CustomEvent(
            'inputchangeriskfactors', {
                bubbles : true,
                composed : true,
                detail: this.riskFactorsItem
            }));
        /*this.dispatchEvent(new CustomEvent(
            'multiselectchange', {
                bubbles : true,
                composed : true,
                detail: {
                    name: 'riskFactorsNew',
                    option: this.title,
                    value: this.toggleChecked
                }
            }));*/
    }
}