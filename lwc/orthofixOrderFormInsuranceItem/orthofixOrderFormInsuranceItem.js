import {api, track, LightningElement} from 'lwc';
import orthofix_navigatetocontactlistview from '@salesforce/label/c.orthofix_navigatetoaccountlistview';
import checkFavInsurance from "@salesforce/apex/OrderController.checkFavoriteInsurance";
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import {showSuccess, showError, showReduceErrors, showLoader, hideLoader} from 'c/orthofixNotificationUtility';
export default class OrthofixOrderFormInsuranceItem extends LightningElement {

    @api formData;
    @api picklistOptions;
    @api requiredFields;
    @api editedData;
    @api showAddFavoriteInsuranceButton;
    @api title;
    @api showCheckbox;
    @api isChecked;
    @track toggleChecked = false;
    @track accordionClass = 'slds-section'; //this starts as section open
    @track makedisabled = false;

    @api objectName;

    @track
    street;
    sfdcbaseUrl;
    navigateToPhysicianListview;
    @api disableForm;
    label={
        navigatetocontactlistview: orthofix_navigatetocontactlistview,
    }


    connectedCallback() {
        this.sfdcbaseUrl = window.location.origin;
        this.navigateToPhysicianListview = this.sfdcbaseUrl + this.label.navigatetocontactlistview;
        if(!this.isShowCheckbox){
            this.accordionClass = 'slds-section slds-is-open';
        }
        //toggleChecked
        if(this.formData[this.objectName] && this.formData[this.objectName].id){
            this.toggleChecked = true;
            //this.dispatchEvent(new CustomEvent('inputchange', {bubbles : true, composed : true, detail: {fieldName: this.objectName+'.'+'isOpen', value: true}}));
            this.accordionClass = 'slds-section slds-is-open';
        }
        else{
            //this.dispatchEvent(new CustomEvent('inputchange', {bubbles : true, composed : true, detail: {fieldName: this.objectName+'.'+'isOpen', value: false}}));
        }

        if(this.formData[this.objectName] && this.formData[this.objectName].carrier){
            if(this.formData[this.objectName].carrier.street){
                this.street = this.formData[this.objectName].carrier.street;
            }
            if(this.formData[this.objectName].carrier.province){
                this.province = this.formData[this.objectName].carrier.province;
            }
            if(this.formData[this.objectName].carrier.city){
                this.city = this.formData[this.objectName].carrier.city;
            }
            if(this.formData[this.objectName].carrier.postalCode){
                this.postalCode = this.formData[this.objectName].carrier.postalCode;
            }
        }
        
    }

    get insurance(){
        return this.formData[this.objectName]?this.formData[this.objectName]:{};
    }

    handleAddToFavoritesClick() {
        console.log('this.editedData.primary.carrier.name' , this.editedData.primary.carrier.name);
        console.log('this.editedData.primary.carrier.name' , this.editedData.secondary.carrier.name);
        console.log('this.editedData.primary.carrier.name' , this.editedData.tertiary.carrier.name);
        checkFavInsurance({insuranceCarrier : this.editedData.primary.carrier.name})
            .then((result) =>{
                if(result){
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: 'Carrier Account Already Exists ',
                            variant: 'error'
                        }),
                    );
                }else{
                    this.dispatchEvent(new CustomEvent(
                        'inputchange', {
                            bubbles : true, composed : true,
                            detail: {
                                fieldName: 'primary.carrier.makeFavorite',
                                value: true
                            }
                        }));
                    this.showAddFavoriteInsuranceButton = false;
                    console.log('hide button:'+this.showAddFavoriteButton);
                    showSuccess(this, 'Added as Favorite', 'Note : Favorite will be saved upon order save');
                }
            })
            .catch((error) => {
                this.error = error;
                console.log(error);
              });
        
    }

    handleInputChange(event){
        let name =  this.objectName+'.'+event.target.name;
        let value = event.target.value;
        // let relationShipPatientName = `${this.objectName}.insured.relationshipToPatient`;
        
        if (name === 'insuranceType') {
            this.requiredFields.insurance.carrier.phone = this.isPhoneNumberOptional;
        }

        // console.log('relationShipPatientName', relationShipPatientName);
        // console.log('name', name);
        // if(name === relationShipPatientName){
        //     console.log('inside cond');
        //     this.requiredFields.insurance.insured.firstName = this.isFirstNameLastNameOptional;
        //     this.requiredFields.insurance.insured.lastName = this.isFirstNameLastNameOptional;
        // }
        this.dispatchEvent(new CustomEvent(
            'inputchange', {
                bubbles : true, composed : true,
                detail: {
                    fieldName: name,
                    value: value
                }
            }));
        this.pupulateSelfInformation(event)
    }

    get formattedSSN() {
        if(this.insurance.insured.socialSecurityNumber){
            let ssn = this.insurance.insured.socialSecurityNumber.replace(/\D/g, ''); 
            if(ssn){
            if (ssn.length > 5) {
                ssn = ssn.slice(0, 3) + '-' + ssn.slice(3, 5) + '-' + ssn.slice(5, 9);
            } else if (ssn.length > 2) {
                ssn = ssn.slice(0, 3) + '-' + ssn.slice(3);
            }
    }
    return ssn;
        }   
    }

    get formattedPhoneNumber() {
        if (this.insurance.carrier.phone) {
            console.log('this.insurance.carrier.phone', this.insurance.carrier.phone);
            let phoneNumber = this.insurance.carrier.phone.replace(/\D/g, ''); // Remove non-numeric characters
            console.log('phoneNumber', phoneNumber);
            if (phoneNumber) {
                if (phoneNumber.length > 3) {
                    phoneNumber = phoneNumber.slice(0, 3) + '-' + phoneNumber.slice(3);
                    if (phoneNumber.length > 7) {
                        phoneNumber = phoneNumber.slice(0, 7) + '-' + phoneNumber.slice(7, 11);
                    }
                }
            }
            return phoneNumber;
        }
    }

    get isPhoneNumberOptional() {
        console.log('inside isphonenumber optional');
        
        let optionalInsuranceTypes = ['Workers Compensation', 'Medicaid', 'Medicare', 'Self-Pay', 'HMO Commercial', 'Other Government'];
       
        let isOptional = optionalInsuranceTypes.includes(this.insurance.insuranceType);
        console.log('isOptional', isOptional);
        if(isOptional){
            return false;
        }else return true;
    }

    // get isFirstNameLastNameOptional(){
    //     console.log('inside isFirstNameLastNameOptional ');
        
    //     let optionalRelationShipPatient = ['Employer'];
    //     let relationshipToPatient = this[this.objectName].insured.relationshipToPatient;
    //     console.log('relationshiptoPatient', relationshipToPatient);
    //     let isOptional = optionalRelationShipPatient.includes(relationshipToPatient);
    //     console.log('isOptional >>1', isOptional);
    //     if(isOptional){
    //         return false;
    //     }else return true;
    // }



    handleKeyDown(event) {
        if (!/^\d$/.test(event.key) && !['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete'].includes(event.key)) {
            event.preventDefault();
        }
    }

    pupulateSelfInformation(event){
        console.log('patient first name:'+JSON.stringify(this.editedData.patientInformation));
        let value = event.target.value;
        if(event.target.name==='insured.relationshipToPatient' && value=='Self' && this.editedData.patientInformation){
            let patientInformation = this.editedData.patientInformation;
            this.template.querySelector('lightning-input[data-name="insured.firstName"]').value = patientInformation.firstName;
            this.dispatchEvent(new CustomEvent('inputchange', {bubbles : true, composed : true, detail: {fieldName: this.objectName+'.'+'insured.firstName', value: patientInformation.firstName}}));

            this.template.querySelector('lightning-input[data-name="insured.lastName"]').value = patientInformation.lastName;
            this.dispatchEvent(new CustomEvent('inputchange', {bubbles : true, composed : true, detail: {fieldName: this.objectName+'.'+'insured.lastName', value: patientInformation.lastName}}));

            this.template.querySelector('lightning-input[data-name="insured.birthDate"]').value = patientInformation.birthDate;
            this.dispatchEvent(new CustomEvent('inputchange', {bubbles : true, composed : true, detail: {fieldName: this.objectName+'.'+'insured.birthDate', value: patientInformation.birthDate}}));
        }
        console.log('event.target.name', event.target.name);
        console.log('value', value);
        if(event.target.name==='insured.relationshipToPatient' && value!='Self'){
            this.template.querySelector('lightning-input[data-name="insured.firstName"]').value="";
            this.template.querySelector('lightning-input[data-name="insured.lastName"]').value="";
            this.template.querySelector('lightning-input[data-name="insured.birthDate"]').value ="";
        }
        // if(event.target.name ==='insured.relationshipToPatient' && value === 'Employer'){
        //     console.log('inside cond');
        //     // this.template.querySelector('lightning-input[data-name="insured.firstName"]').value="";
        //     // this.template.querySelector('lightning-input[data-name="insured.lastName"]').value="";
        //     // this.template.querySelector('lightning-input[data-name="insured.birthDate"]').value ="";
        //     this.requiredFields.insurance.insured.firstName = false
        //     this.requiredFields.insurance.insured.lastName = false
        //     this.requiredFields.insurance.insured.birthDate = false
            
        //     this.makedisabled = true
        // }else{
        //     this.requiredFields.insurance.insured.firstName = true
        //     this.requiredFields.insurance.insured.lastName = true
        //     this.requiredFields.insurance.insured.birthDate = true
        //     this.makedisabled = false
        // }
    }

    handleAddressChange(event){
        let name = this.objectName+'.carrier';
        this.dispatchEvent(new CustomEvent('inputchange', {bubbles : true, composed : true, detail: {fieldName: name+'.street', value: event.target.street}}));
        this.dispatchEvent(new CustomEvent('inputchange', {bubbles : true, composed : true, detail: {fieldName: name+'.city', value: event.target.city}}));
        this.dispatchEvent(new CustomEvent('inputchange', {bubbles : true, composed : true, detail: {fieldName: name+'.province', value: event.target.province}}));
        this.dispatchEvent(new CustomEvent('inputchange', {bubbles : true, composed : true, detail: {fieldName: name+'.country', value: event.target.country}}));
        this.dispatchEvent(new CustomEvent('inputchange', {bubbles : true, composed : true, detail: {fieldName: name+'.postalCode', value: event.target.postalCode}}));
    }

    changeAccordion(event){
        if(this.accordionClass.includes('slds-is-open')){ // if section is open
            this.accordionClass = 'slds-section'; //set class to close
            this.toggleChecked = false;
            this.dispatchEvent(new CustomEvent('inputchange', {bubbles : true, composed : true, detail: {fieldName: this.objectName+'.'+'isOpen', value: false}}));
        }else{
            this.accordionClass = 'slds-section slds-is-open'; //set class to be open
            this.dispatchEvent(new CustomEvent('inputchange', {bubbles : true, composed : true, detail: {fieldName: this.objectName+'.'+'isOpen', value: true}}));
            this.toggleChecked = true;
        }
    }

    get isShowCheckbox(){
        return this.showCheckbox=='true';
    }

    handleChangeFavoriteInsurances(event){
        this.handleInputChange(event);
        let value = event.target.value;
        let favoriteInsurance;
        console.log('Picklsit values:'+JSON.stringify(this.picklistOptions));
        this.picklistOptions.favoriteInsurances.forEach(el=>{
            if(el.favoriteInsurance.id===value){
                console.log('check insureance:'+JSON.stringify(el));
                favoriteInsurance = el.favoriteInsurance;
            }
        });
        if(favoriteInsurance){
            console.log('this.picklistOptions.favoriteInsurances', JSON.stringify(favoriteInsurance));
            console.log('this.picklistOptions.favoriteInsurances', JSON.stringify(this.picklistOptions.favoriteInsurances));
            if(favoriteInsurance.name){
                this.populateFavValue(favoriteInsurance, 'name');
            }
            if(favoriteInsurance.insuranceType){
                this.populateFavValue(favoriteInsurance, 'insuranceType');
            }
            if(favoriteInsurance.address2){
                this.street = favoriteInsurance.address2;
                this.dispatchEvent(new CustomEvent('inputchange', {bubbles : true, composed : true, detail: {fieldName: this.objectName+'.carrier.province', value: this.address2}}));
                //this.populateFavValue(favoriteInsurance, 'address2');
            }
            if(favoriteInsurance.province){
                this.province = favoriteInsurance.province;
                this.dispatchEvent(new CustomEvent('inputchange', {bubbles : true, composed : true, detail: {fieldName: this.objectName+'.carrier.province', value: this.province}}));
            }
            if(favoriteInsurance.city){
                this.city = favoriteInsurance.city;
                this.dispatchEvent(new CustomEvent('inputchange', {bubbles : true, composed : true, detail: {fieldName: this.objectName+'.carrier.city', value: this.city}}));
            }
            if(favoriteInsurance.postalCode){
                this.postalCode = favoriteInsurance.postalCode;
                this.dispatchEvent(new CustomEvent('inputchange', {bubbles : true, composed : true, detail: {fieldName: this.objectName+'.carrier.postalCode', value: this.postalCode}}));
            }
            if(favoriteInsurance.street){
                this.street = favoriteInsurance.street;
                this.dispatchEvent(new CustomEvent('inputchange', {bubbles : true, composed : true, detail: {fieldName: this.objectName+'.carrier.street', value: this.street}}));
            }else{
                this.street = '';
                this.dispatchEvent(new CustomEvent('inputchange', {bubbles : true, composed : true, detail: {fieldName: this.objectName+'.carrier.street', value: this.street}}));
            }
            if(favoriteInsurance.country){
                this.country = favoriteInsurance.country;
                this.dispatchEvent(new CustomEvent('inputchange', {bubbles : true, composed : true, detail: {fieldName: this.objectName+'.carrier.country', value: this.country}}));
            }
            if(favoriteInsurance.phone){
                this.populateFavValue(favoriteInsurance, 'phone');
            }
        }
    }

    populateFavValue(favoriteInsurance, fieldNameParam){
        let value = favoriteInsurance[fieldNameParam];
        let fieldName;
        if(fieldNameParam=='insuranceType'){
            fieldName = fieldNameParam;
        }
        else{
            fieldName = "carrier."+fieldNameParam;
        }
        let globalFieldName = this.objectName+"."+fieldName;
        this.dispatchEvent(new CustomEvent('inputchange', {bubbles : true, composed : true, detail: {fieldName: globalFieldName, value: value}}));
        this.template.querySelector('[data-name="'+fieldName+'"]').value = value;
    }


}