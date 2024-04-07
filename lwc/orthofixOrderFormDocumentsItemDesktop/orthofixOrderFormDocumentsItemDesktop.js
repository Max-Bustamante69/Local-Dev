/**
 * @description       : 
 * @author            : manish.tyagi@argano.com
 * @group             : 
 * @last modified on  : 04-02-2024
 * @last modified by  : Lokesh Kesava | lokesh.kesava@argano.com
**/
import {showSuccess, showError, showReduceErrors, showLoader, hideLoader} from 'c/orthofixNotificationUtility';
import {api, LightningElement, track, wire} from 'lwc';
import uploadFile from "@salesforce/apex/FileUploaderController.uploadFile";
import getCurrentUser from "@salesforce/apex/FileUploaderController.getCurrentUser";
import getFiles from "@salesforce/apex/FileUploaderController.getFiles";
import deleteContentVersionRecord from "@salesforce/apex/FileUploaderController.deleteContentVersionRecord";
import {NavigationMixin} from "lightning/navigation";
import physioStimLOMNFormURL from '@salesforce/label/c.PhysioStim_LOMN_Form_Titan_URL';
import accelStimLOMNFormURL from '@salesforce/label/c.AccelStim_LOMN_Form_Titan_URL';
import spinalStimLOMNFormURL from '@salesforce/label/c.SpinalStim_LOMN_Form_Titan_URL';
import cervicalStimLOMNFormURL from '@salesforce/label/c.CervicalStim_LOMN_Form_Titan_URL';



export default class OrthofixOrderFormDocumentsItemDesktop extends NavigationMixin(LightningElement) {

    label = {
        physioStimLOMNFormURL,
        accelStimLOMNFormURL,
        spinalStimLOMNFormURL,
        cervicalStimLOMNFormURL
    };

    @api formData;
    @api picklistOptions;
    @api requiredFields;
    @track orderFiles = [];
    @track isShowModal = false;
    @track isShowFileUploadModal = false;
    @track values= new Set();
    @track otherDisabled = true;
    @track docTypeOther = '';
    @track files = [];
    @api clinicalDisableForm;
    @track otherRequired = false;
    @track currentUser;
    @track error;
    disableUploadDocuments = false;
    @api orderCancelled;
    @track disablerequiredforPrecriptionCheck = true;
    loadFilesCalled = false;

    connectedCallback() {
        this.loadFiles().catch(e => console.log(e));
    }

    


    get isSubmittedToIA() {
        return this.formData.Status === "Submitted To IA";
    }

    get deficienciencies() {
        return (this.formData.oracleDeficiencies || '').split(';').filter(x => !!x && x !== 'Other');
    }

    get otherDeficiencies() {
        if ((this.formData.oracleDeficiencies || '').includes('Other')) {
            return (this.formData.oracleOtherDeficiencies || '').split(';').filter(x => !!x).map(x => `Other(${x})`);
        }

        return [];
    }

    get mainDeficiencies() {
        return [...this.deficienciencies, ...this.otherDeficiencies].filter(x => x !== 'LETTER OF MEDICAL NECESSITY');
    }

    get lomnDeficiencies() {
        return [...this.deficienciencies, ...this.otherDeficiencies].filter(x => x === 'LETTER OF MEDICAL NECESSITY');
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
    get myRecordId() {
        return this.formData.id;
    }

    @wire(getCurrentUser)
    wiredUser({ error, data }) {
    if (data) {
        this.currentUser = data;
        this.disableUploadDocuments = this.currentUser.UserRole.Name === 'BGT Fitter';
        this.disablerequiredforPrecriptionCheck = !this.disableUploadDocuments;
        console.log('this.disableUploadDocuments', this.disableUploadDocuments);
    } else if (error) {
        this.error = error;
    }
}

    get disableCheckeboxes() {
       return this.orderCancelled;
    }

    docTypeChange(event) {
        let name = event.target.name;
        console.log('name', name);

        if(name === 'Prescription'){
            console.log('inside doctypechange');
            const isChecked = event.detail.checked;
            console.log('isChecked', isChecked);
            this.dispatchEvent(new CustomEvent('checkboxchange', { detail: isChecked }));
            
        }
        if (event.detail.checked) {
            this.values.add(event.currentTarget.label);

        } else {

            this.values.delete(event.currentTarget.label);
        }
        console.log(JSON.stringify([...this.values]));
        this.otherDisabled = ![...this.values].includes('Other')
        this.otherRequired = !this.otherDisabled;
    }


    openfileUpload(event) {
        showLoader(this);
        if (event.target.files.length > 0) {
            for (let i = 0; i < event.target.files.length; i++) {
                const file = event.target.files[i];
                const reader = new FileReader();
                reader.onload = () => {
                    let base64 = reader.result.split(',')[1];
                    uploadFile({ base64, filename:  file.name, recordId: this.myRecordId, docType: [...this.values].join(';'), docTypeOther: this.docTypeOther }).then(result=>{
                        showSuccess(this, 'Success', "File uploaded successfully");
                        this.loadFiles().catch(e => console.log(e));
                        
                    }).catch(e => {
                        showError(this, 'Error', `${e}`);
                    });
                };
                
                reader.readAsDataURL(file);
            }
              this.hideFileUploadModal();
              hideLoader(this);
        }

       /* const file = event.target.files[0];
        let reader = new FileReader()
        reader.onload = () => {
            let base64 = reader.result.split(',')[1]
            uploadFile({ base64, filename:  file.name, recordId: this.myRecordId, docType: [...this.values].join(';'), docTypeOther: this.docTypeOther }).then(result=>{
                let title = `${file.name} uploaded successfully!!`
                this.hideFileUploadModal();
                hideLoader(this);
                showSuccess(this, 'Success', title);
                this.loadFiles().catch(e => console.log(e));
            }).catch(e => {
                this.hideFileUploadModal();
                hideLoader(this);
                showError(this, 'Error', `${e}`);
                console.log(JSON.stringify(e))
            });
        }
        reader.readAsDataURL(file);*/
    }

    async loadFiles() {
        showLoader(this);
        this.orderFiles = await getFiles({recordId: this.myRecordId});
        console.log(JSON.stringify(this.orderFiles));
        console.log('this.orderFiles', this.orderFiles.length);
        hideLoader(this);

        if (this.orderFiles.length == 0) {
            console.log('inside loadfiles cond');
        const isFilesExist = false;
        console.log('isFilesExist', isFilesExist);
        this.dispatchEvent(new CustomEvent('fileexist', { detail: isFilesExist }));
        }
        

    }
    handleFileDelete(event){
       const fileId = event.target.value;
       deleteContentVersionRecord({ contentVersionId: fileId })
       .then(result => {
           if (result) {
            this.orderFiles = this.orderFiles.filter(file => file.Id !== fileId);
            showSuccess(this, 'Success', "File deleted successfully");
           } else {
               showError(this, 'Error', 'Record not found or an error occurred.');
           }
       })
       .catch(error => {
           showError(this, 'Error', 'An error occurred while deleting the record.');
       });
  
    }

    


    handleInputChange(event){
        let value = event.target.value;
        this.docTypeOther = value;
    }

    generate() {
        this.isShowModal = true;
    }

    hideModal() {
        this.isShowModal = false;
    }

    showFileUploadModal()  {
        this.isShowFileUploadModal = true;
    }
    hideFileUploadModal() {
        this.isShowFileUploadModal = false;
    }

    
    

    renderedCallback() {
    if (!this.loadFilesCalled) {
        this.loadFiles().then(() => {
            this.loadFilesCalled = true;
        }).catch(e => console.log(e));
        }
    }   
}