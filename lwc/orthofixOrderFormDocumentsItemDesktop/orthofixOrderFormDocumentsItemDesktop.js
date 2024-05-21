/**
 * @description       : 
 * @author            : manish.tyagi@argano.com
 * @group             : 
 * @last modified on  : 05-16-2024
 * @last modified by  : Lokesh Kesava | lokesh.kesava@argano.com
**/
import {showSuccess, showError, showReduceErrors, showLoader, hideLoader} from 'c/orthofixNotificationUtility';
import {api, LightningElement, track, wire} from 'lwc';
import uploadFile from "@salesforce/apex/FileUploaderController.uploadFile";
import getCurrentUser from "@salesforce/apex/FileUploaderController.getCurrentUser";
import getFiles from "@salesforce/apex/FileUploaderController.getFiles";
import hasFiles from "@salesforce/apex/FileUploaderController.hasFiles";
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
    @track filesExist = false;
    @track isShowModal = false;
    @track isShowFileUploadModal = false;
    @track isShowFileUploadMobile = false;
    @track isShowFileUploadButtonMobile = false;
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
    @track selectedValueList = '';
    @track selectedValue = [];
    @track showOtherMultiSelect = false;
    @track selectedValueOtherList = '';
    selectedDocumentTypes=[];
    selectedDocumentOtherTypes=[];


    connectedCallback() {
        this.loadFiles().catch(e => console.log(e));
    }

    get sortedPicklistOptions() {
        if (this.picklistOptions && this.picklistOptions.doctype) {
            const options = [...this.picklistOptions.doctype];
            options.sort((a, b) => {
                if (a.label === 'Other') return 1;
                if (b.label === 'Other') return -1;
                return a.label.localeCompare(b.label);
            });
            return options;
        }
        return [];
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
        return [...this.deficienciencies, ...this.otherDeficiencies].filter(x => x !== 'LETTER OF MEDICAL NECESSITY').filter(d => !this.orderFiles.some(f => f.docType === d));
    }

    get lomnDeficiencies() {
        return [...this.deficienciencies, ...this.otherDeficiencies].filter(x => x === 'LETTER OF MEDICAL NECESSITY').filter(d => !this.orderFiles.some(f => f.docType === d));
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

    get addFileButtonLabel() {
        return this.filesExist ? 'ADD ANOTHER DOCUMENT' : 'ADD DOCUMENT';
    }

    docTypeChange(event) {
        let name = event.target.name;
        console.log('name', name);

        if(name === 'PRESCRIPTION'){
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

    handleSelectOptionList(event){
        let isChecked = false;
        console.log('eventdetail>>', event.detail);
        this.selectedValueList = event.detail;
        console.log('this.selectedValueList', this.selectedValueList);
        this.showOtherMultiSelect = this.selectedValueList == 'Other'
        this.otherRequired = this.showOtherMultiSelect;
        !this.showOtherMultiSelect ? this.showUploadButtonMobile() : this.hideUploadButtonMobile();
        if(this.selectedValueList == 'PRESCRIPTION'){
            isChecked = true;
            console.log('inside 1')
        } 
        else{
            isChecked = false;
            console.log('inside 2')
        }
        console.log('isChecked', isChecked);
        this.dispatchEvent(new CustomEvent('checkboxchange', { detail: isChecked }));


        
    }

    @api checkOrderFiles(){
        hasFiles({ orderId: this.myRecordId })
            .then(result => {
                console.log('result hasfiles' , result);
                filesExist = !result;
                this.dispatchEvent(new CustomEvent('fileexist', { detail: filesExist }));
            })
            .catch(error => {
                console.error('Error:', error);
                this.hasFiles = undefined;
            });
    }
    
        
            
        filePreview(event){
            console.log(event.target.value);
            console.log(event.target.dataset.ContentdocumentId);
            this[NavigationMixin.Navigate]({ 
                type:'standard__namedPage',
                attributes:{ 
                    pageName:'filePreview'
                },
                state:{ 
                    selectedRecordId: event.target.value
                }
            })
        }
        
        
    

    handleSelectOtherOptionList(event){
        console.log(event.detail);
        this.selectedValueOtherList  = event.detail;
        console.log('this.selectedValueOtherList', this.selectedValueOtherList);
    }
     
   

    openfileUpload(event) {
        showLoader(this);
        if (event.target.files.length > 0) {
            for (let i = 0; i < event.target.files.length; i++) {
                const file = event.target.files[i];
                const reader = new FileReader();
                reader.onload = () => {
                    let base64 = reader.result.split(',')[1];
                    uploadFile({ base64, filename:  file.name, recordId: this.myRecordId, docType: this.selectedValueList, docTypeOther: this.selectedValueOtherList}).then(result=>{
                        showSuccess(this, 'Success', "File uploaded successfully");
                        this.loadFiles().catch(e => console.log(e));
                        
                    }).catch(e => {
                        showError(this, 'Error', `${e}`);
                    });
                };
                
                reader.readAsDataURL(file);
            }
              this.hideFileUploadModal();
              this.hideFileUploadMobile();
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
        console.log('Doc type',JSON.stringify(this.orderFiles.DocumentType__c));
        console.log('Other doc type',this.orderFiles.DocumentType__c);
        console.log('this.orderFiles', this.orderFiles.length);
        hideLoader(this);
        let isPrescriptionExist = false;
        
        if (!this.hasFiles()) {
            console.log('inside loadfiles cond');
            console.log('Files Exist', this.filesExist);

            //this.dispatchEvent(new CustomEvent('fileexist', { detail: filesExist }));
        }else{
            let documentTypes = [];
            let OtherdocumentTypes = [];
            console.log('documentTypes', documentTypes);
            console.log('OtherdocumentTypes', OtherdocumentTypes);
            this.orderFiles.forEach(file => {
                file.docType = file.DocumentType__c;
                file.icon = 'utility:success';
                file.variant = 'success';
                let docType = file.DocumentType__c;
                let otherDocType = file.DocumentTypeOther__c;
                if (docType) {
                    documentTypes.push(docType);
                }
                if (otherDocType) {
                    file.docType = `Other(${otherDocType})`;
                    OtherdocumentTypes.push(otherDocType);
                }

                if (docType === "PRESCRIPTION") {
                    isPrescriptionExist = true; 
                }

                if ([...this.deficienciencies, ...this.otherDeficiencies].includes(file.docType)) {
                    file.icon = 'utility:clock';
                    file.variant = 'warning';
                }
            });

            console.log('Is Prescription Exist:', isPrescriptionExist);
            this.dispatchEvent(new CustomEvent('checkboxchange', { detail: isPrescriptionExist }));
            this.resetUpload()
            this.updateFileStatus();
            //this.dispatchEvent(new CustomEvent('fileexist', { detail: filesExist }));
            // this.selectedDocumentTypes = documentTypes.join(',');
            // this.selectedDocumentOtherTypes = OtherdocumentTypes.join(',');
            // console.log('this.selectedDocumentTypes', this.selectedDocumentTypes);
            // console.log('this.selectedDocumentOtherTypes', this.selectedDocumentOtherTypes);
        }
        // this.selectedDocumentTypes = documentTypes.join(',');
        // this.selectedDocumentOtherTypes = OtherdocumentTypes.join(',');
        

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
          this.updateFileStatus();
       })
       .catch(error => {
           showError(this, 'Error', 'An error occurred while deleting the record.');
       });
       

    }

    


    handleInputChange(event){
        let value = event.target.value;
        this.selectedValueOtherList  = value;
        this.selectedValueOtherList.trim() != '' ? this.showUploadButtonMobile() : this.hideUploadButtonMobile();
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

    showFileUploadMobile() {
        this.isShowFileUploadMobile = true;
    }

    hideUploadButtonMobile() {
        this.isShowFileUploadButtonMobile = false;
    }

    showUploadButtonMobile() {
        this.isShowFileUploadButtonMobile = true;
    }

    hideFileUploadMobile() {
        this.isShowFileUploadMobile = false;
    }

    hasFiles() {
        return this.filesExist = this.orderFiles.length > 0;    
    }

    updateFileStatus(){
        this.filesExist = this.hasFiles();
    }

    resetUpload() {
        this.selectedValueList = '';
        this.selectedValueOtherList = '';
        this.showOtherMultiSelect = false;
        this.isShowFileUploadMobile = false;
        this.isShowFileUploadButtonMobile = false;
    }






    
    

    // renderedCallback() {
    // if (!this.loadFilesCalled) {
    //     this.loadFiles().then(() => {
    //         this.loadFilesCalled = true;
    //     }).catch(e => console.log(e));
    //     }
    // }   
}