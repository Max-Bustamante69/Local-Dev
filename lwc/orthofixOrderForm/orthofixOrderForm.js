/**
 * @description       :
 * @author            : Lokesh Kesava | lokesh.kesava@argano.com
 * @group             :
 * @last modified on  : 04-12-2024
 * @last modified by  : Lokesh Kesava | lokesh.kesava@argano.com
 **/
import {api, track, LightningElement, wire} from 'lwc';
import LightningConfirm from 'lightning/confirm';
import getPicklistValues from "@salesforce/apex/OrthoFixOrderFormController.getPicklistValues";
import getOrder from "@salesforce/apex/OrderController.getOrder";
// import getCurrentUserPermissions from "@salesforce/apex/OrderController.getCurrentUserPermissions";
import getCurrentUser from "@salesforce/apex/OrderController.getCurrentUser";
import saveOrder from "@salesforce/apex/OrderController.saveOrder";
import { refreshApex } from '@salesforce/apex';
import isFavorite from "@salesforce/apex/OrderController.isFavorite";
import isFavoriteInsurance from "@salesforce/apex/OrderController.isFavoriteInsurance";
import createEvent from "@salesforce/apex/OrderController.createEvent";
import submitAndSave from "@salesforce/apex/OrderController.submitAndSave";
import saveInsurance from "@salesforce/apex/OrderController.saveInsurance";
import saveClinicalInformation from "@salesforce/apex/OrderController.saveClinicalInformation";
import {showSuccess, showError, showReduceErrors, showLoader, hideLoader} from 'c/orthofixNotificationUtility';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import {NavigationMixin} from 'lightning/navigation';
import Orthofix_checkmarkicon from "@salesforce/resourceUrl/Orthofix_checkmarkicon";


export default class OrthofixOrderForm extends NavigationMixin(LightningElement) {


    @api recordId;
    @track booleanOrderStatus = false;
    @track lastTimeCheckFavoriteRequested = 0;
    @track showAddFavoriteButton = false;
    @track showAddFavoriteInsuranceButton = false;
    @track headerText = 'Create Order: ';
    @track disableForm = false;
    @track clinicalDisableForm = false;
    @track isChannelScriptOrder = false;
    @track isRequired = true;
    @track isNavigate=false;
    hideSaveButtons = false;
    showheader = true;
    showSubmit = false;
    showSaveAndSubmit = false;
    makeEventReadOnly = false;
    @track iconClass;
    orderStatus;
    orderOktoFitCheck = false;
    showSchAppitmentAndFittingTab = false;
    @track prescriptionChecked;
    @track currentUser;
    @track error;
    @track checkUserRoleFitter = false;
    @track showCancelModal = false;
    @track hideAllButtons = true;
    @track orderCanceled = false;
    @track currentUserPermissions;
    @track isFileExist = false;
    
    

    @wire(getCurrentUser)
    wiredUser({ error, data }) {
        if (data) {
            this.currentUser = data;
            this.checkUserRoleFitter = this.currentUser.UserRole.Name === 'BGT Fitter';
            console.log(' this.disableUploadDocuments',  this.checkUserRoleFitter);
        } else if (error) {
            this.error = error;
        }
    }

    // @wire(getCurrentUserPermissions)
    // wiredUserPermissions({ error, data }) {
    //     if (data) {
    //         this.currentUserPermissions = data;
    //         console.log(' this.currentUserPermissions',  this.currentUserPermissions);
    //     } else if (error) {
    //         this.error = error;
    //     }
    // }

   

    connectedCallback() {

        


        this.getPicklistOptions();
        console.log('this.recordId', this.recordId);
        if (this.recordId) {
            this.getOrder();
        }
        this.handleTabsValidation();
    }

    

    activeTab = 'patientTab';
    showSaveContinue;
    showOktofit = false;
    oktofitIcon = null;
    // showOrdershortdesc=false;
    @track
    picklistOptions = {
        territoryManagers: [],
        productTypes: [],
        genders: [],
        surgeryTypes: [],
        diagnosisStarts: [],
        diagnosisEnds: [],
        diagnosisgrade: [],
        insuranceTypes: [],
        favoritePhysicians: [],
        patientRelationships: [],
        favoriteInsurances: [],
        diagnosisTypes: [],
        phonetype: [],
        initialsurgery: [],
        initialsurgerygraftsource: [],
        revisionsurgery: [],
        fracturetype: [],
        fractureaffectedsite: [],
        fractureside: [],
        fracturesite: [],
        previoustreatment: [],
        assignment:[],
        doctype:[],
        otherdoctype:[]

    };

    @track
    editedData = {};

    @track
    formData = {
        initialSurgery: [],
        previoustreatment: [],
        revisionSurgeryGraftSource: [],
        plannedTreatmentGraftSource: [],
        revisionSurgery: [],
        initialSurgeryGraftSource: [],
        fractureSide: '',
        fractureAffectedSite: '',
        fractureType: [],
        fractureSite: [],
        patientInformation: {
            altContact: {},
            prescriber: {},
            emergencyContact: {},
            primaryCarePhysician: {},
        },
        primary: {
            carrier: {},
            insured: {}
        },
        secondary: {
            carrier: {},
            insured: {}
        },
        tertiary: {
            carrier: {},
            insured: {}
        },
        quaternary: {
            carrier: {},
            insured: {}
        },
        eventInformation: {}
    };

    requiredFields = {
        patientInformation: {
            productType: true,
            territoryManager: false,
            firstName: true,
            lastName: true,
            gender: true,
            birthDate: true,
            address2: false,
            phone: true,
            street: true,
            city: true,
            province: true,
            postalCode: true,
            country: false,
            phonetype: true,
            emergencyContact: {
                name: false,
                relationship: false,
                phone: false,
                extension: false,
            },
            altContact: {
                name: false,
                phone: false,
                location2: false,
                altPhone: false,
            },
            prescriber: {
                favPhysician: false,
                searchByNpi: false,
                firstName: true,
                lastName: true,
                npi: true,
                licence: false,
                address2: false,
                phone: true,
                searchByZip: false,
                postalCode: true,
                city: true,
                province: true,
                country: false,
            },
            primaryCarePhysician: {
                name: false,
                npi: false,
                phone: false,
                fax: false,
            }
        },
        insurance: {
            favoriteInsurance: false,
            insuranceType: true,
            carrier: {
                name: true,
                postalCode: false,
                city: false,
                province: true,
                phone: true,
                extension: false,
            },
            insured: {
                relationshipToPatient: true,
                firstName: true,
                lastName: true,
                socialSecurityNumber: false,
                birthDate: false,
                groupNumber: true,
                policyNo: true,
                employer: false,
                insuranceContact: false
            }
        },
        attorneyVisibleFields: {
            nurseCaseManager: false,
            attorneyNamePhone: false
        },
        surgeryType: true,
        surgeryDate: true,
        startingLevel: true,
        endingLevel: true,
        dateOfInjury: false,
        dateOfPrescription: true
    };

    getOrder() {
        console.log('recordId', this.recordId);
        showLoader(this);
        getOrder({id: this.recordId})
            .then((result) => {
                let orderData = JSON.parse(JSON.stringify(result));
                console.log("showOrdershortdesc and " + JSON.stringify(orderData))
                console.log('status '+JSON.stringify(orderData.Status))
                this.oktofitIcon = orderData.Oracle_OkToFit_Icon;
                console.log('orderOktoFitCheck' ,orderData.oracleOkToFit);
                this.orderOktoFitCheck = orderData.oracleOkToFit;
                this.headerText = this.headerText + orderData.patientInformation.productType +'™' +' '+' - '+ ' ' + orderData.patientInformation.firstName + '  ' + orderData.patientInformation.lastName;
                this.orderStatus = orderData.Status;
                if (orderData.Status === "Submitted To Orthofix") {
                    this.hideSaveButtons = true;
                }
                
                if (orderData.Status === "Submitted To IA") {
                    this.showheader = false;
                    this.disableForm = true;
                    this.clinicalDisableForm = true;
                    this.hideSaveButtons = true;
                    if (this.oktofitIcon != null) {
                        this.showOktofit = true;
                    }
                }
                else if (orderData.Status === "Canceled"){
                    console.log("come here in canceled status");
                    this.disableForm = true;
                    this.showSubmit = false;
                    this.orderCanceled = true;
                    this.clinicalDisableForm = true;
                    this.hideSaveButtons = true;
                    this.makeEventReadOnly=true;
                    this.hideAllButtons = false;
                    
                }
                else {
                    this.clinicalDisableForm = false;
                    this.disableForm = false;
                    this.makeEventReadOnly=false;
                    this.hideSaveButtons = false;
                    this.showSubmit=true;
                    //this.disableTabsetClass = true;
                    if(orderData.Status === "Started" && orderData.isChannelScriptOrder === true){
                        this.isChannelScriptOrder = true;
                        this.requiredFields["dateOfPrescription"] = false;
                        this.isRequired = false;
                    }
                }

                if(orderData.Status != "Started" && this.orderOktoFitCheck){
                    this.showSchAppitmentAndFittingTab = true
                }else this.showSchAppitmentAndFittingTab = false

                if (!orderData.patientInformation.altContact) {
                    orderData.patientInformation.altContact = {};
                }
                if (!orderData.patientInformation.prescriber) {
                    orderData.patientInformation.prescriber = {};
                }
                if (!orderData.patientInformation.emergencyContact) {
                    orderData.patientInformation.emergencyContact = {};
                }
                if (!orderData.patientInformation.primaryCarePhysician) {
                    orderData.patientInformation.primaryCarePhysician = {};
                }

                if (!orderData.primary) {
                    orderData.primary = {};
                }
                if (!orderData.primary.carrier) {
                    orderData.primary.carrier = {};
                }
                if (!orderData.primary.insured) {
                    orderData.primary.insured = {};
                }

                if (!orderData.secondary) {
                    orderData.secondary = {};
                }
                if (!orderData.secondary.carrier) {
                    orderData.secondary.carrier = {};
                }
                if (!orderData.secondary.insured) {
                    orderData.secondary.insured = {};
                }

                if (!orderData.tertiary) {
                    orderData.tertiary = {};
                }
                if (!orderData.tertiary.carrier) {
                    orderData.tertiary.carrier = {};
                }
                if (!orderData.tertiary.insured) {
                    orderData.tertiary.insured = {};
                }

                if (!orderData.quaternary) {
                    orderData.quaternary = {};
                }
                if (!orderData.quaternary.carrier) {
                    orderData.quaternary.carrier = {};
                }
                if (!orderData.quaternary.insured) {
                    orderData.quaternary.insured = {};
                }

                this.formData = orderData;
                ['initialSurgery', 'revisionSurgeryGraftSource', 'revisionSurgery', 'initialSurgeryGraftSource',
                    'fractureSite', 'fractureType', 'plannedTreatmentGraftSource', 'previousTreatment'].forEach(picklistName => {
                    this.formData[picklistName] = !!this.formData[picklistName] ? this.formData[picklistName].split(';') : [];
                });
                this.editedData = orderData;

                this.handleAddFavoritesButton({fieldName: 'patientInformation.prescriber.firstName'});
                //this.handleAddFavoritesInsuranceButton({fieldName: 'primary.carrier.name'});

                hideLoader(this);
            })
            .catch((error) => {
                hideLoader(this);
                showReduceErrors(this, error);
            });
    }

    adjustMultiPicklist(picklists) {


    }

    
    handleActive(event) {

        this.handleTabsValidation();
        this.activeTab = event.target.value;
        if (this.activeTab === "patientTab" || this.activeTab === "insuranceTab") {
            this.showSaveContinue = true;
            this.showSubmit = false;
            this.showSaveAndSubmit = false;
        } else if (this.activeTab === "clinicalTab") {
            this.showSaveAndSubmit = true;
            this.showSaveContinue = false;
            this.showSubmit = false;
        } else if (this.activeTab === "scheduleAppointmentTab") {
            this.showSubmit = true;
            this.showSaveAndSubmit = false;
            this.showSaveContinue = false;
        }
        this.handleTabsValidation();
    }


    handleTabsValidation() {

        let unfulfilledTab = this.handleMandatoryFieldsValidate();

        if (this.activeTab === "patientTab" && unfulfilledTab === "") {
            this.patientIcon = "utility:success";
        } else if (this.activeTab === "patientTab" && unfulfilledTab === "patientTab") {
            this.patientIcon = "";
        }
        if (this.activeTab === "insuranceTab" && unfulfilledTab === "") {
            this.insuranceIcon = "utility:success";
        } else if (this.activeTab === "insuranceTab" && unfulfilledTab === "insuranceTab") {
            this.insuranceIcon = "";
        }
        if (this.activeTab === "clinicalTab" && (unfulfilledTab === "" || this.isChannelScriptOrder === true)) {
            this.clinicalIcon = "utility:success";
        } else if (this.activeTab === "clinicalTab" && unfulfilledTab === "clinicalTab") {
            this.clinicalIcon = "";
        }
    }

     handleSaveContinue() {
            this.handleSave();
            this.handleTabsValidation();
                if (this.activeTab === "patientTab") {
                    setTimeout(() => {
                        this.activeTab = "insuranceTab";
                    }, 5000);
                } else if (this.activeTab === "insuranceTab") {
                    setTimeout(() => {
                        this.activeTab = "clinicalTab";
                    }, 5000);
                   
                }
    }

    handleSubmitToIA() {
        console.log('this.prescriptionChecked', this.prescriptionChecked);
        console.log('this.isFileExist', this.isFileExist);
        if (!this.prescriptionChecked && !this.checkUserRoleFitter && !this.isFileExist) {
            showError(this, 'Validation Error', 'Please upload a Prescription before submitting the Order.');
            return; 
        }
        this.handleTabsValidation();
        this.showheader = false;
        this.booleanOrderStatus = false;
        if (this.patientIcon === "utility:success" && this.insuranceIcon === "utility:success" && this.clinicalIcon === "utility:success") {
            this.booleanOrderStatus = true;
            this.save(true);
            console.log('this.disableForm', this.disableForm);
                    setTimeout(() => {
                        window.location.reload();
                    }, 10000);
        } else {
            showError(this, 'Validation Error', 'Please fill in all required fields before submitting the order');
            return;
        }
    }

    handlePrescriptionCheck(event){
        this.prescriptionChecked = event.detail;
        console.log('inside preciption checked or no', this.prescriptionChecked);
    }

    handleFilesCheck(event){
        this.isFileExist = event.detail;
        console.log('inside preciption checked or no', this.isFileExist);
    }



    handleMandatoryFieldsValidate() {

        let unfulfilledTab = "";
        let missedFields = [];
        if (this.activeTab === "patientTab") {
            if (!this.editedData.patientInformation) {
                missedFields.push('patientInformation');
            }
            let patientInformation = this.validateItem(this.requiredFields.patientInformation, this.editedData, 'patientInformation');
            missedFields = [...missedFields, ...patientInformation];

            let prescriber = this.validateItem(this.requiredFields.patientInformation.prescriber, this.editedData.patientInformation, 'prescriber');
            missedFields = [...missedFields, ...prescriber];
            if (missedFields.length > 0) {
                unfulfilledTab = "patientTab";
            }
            return unfulfilledTab;
        }
        if (this.activeTab === "insuranceTab") {
            let insurancePrimary = this.validateInsuranceItem('primary');
            missedFields = [...missedFields, ...insurancePrimary];

            let insuranceSecondary = this.validateInsuranceItem('secondary');
            missedFields = [...missedFields, ...insuranceSecondary];

            let insuranceTertiary = this.validateInsuranceItem('tertiary');
            missedFields = [...missedFields, ...insuranceTertiary];

            let insuranceQuaternary = this.validateInsuranceItem('quaternary');
            missedFields = [...missedFields, ...insuranceQuaternary];

            if (missedFields.length > 0) {
                unfulfilledTab = "insuranceTab";
            }
            return unfulfilledTab;
        }
        if (this.activeTab === "clinicalTab") {
            if (!this.editedData.patientInformation) {
                missedFields.push('patientInformation');
            } else {
                if (this.editedData.patientInformation.productType == 'AccelStim' || this.editedData.patientInformation.productType == 'PhysioStim') {
                    if (!this.editedData.dateOfInjury) {
                        missedFields.push('dateOfInjury');
                    }
                }
                if (this.editedData.patientInformation.productType == 'CervicalStim' || this.editedData.patientInformation.productType == 'SpinalStim') {
                    if (!this.editedData.surgeryStartingLevel) {
                        missedFields.push('StartingLevel');
                    }
                    if (!this.editedData.surgeryEndingLevel) {
                        missedFields.push('EndingLevel');
                    }
                    if (!this.editedData.surgeryType) {
                        missedFields.push('surgeryType');
                    }
                    if (!this.editedData.surgeryDate) {
                        missedFields.push('surgeryDate');
                    }
                }
            }
            if (!this.editedData.dateOfPrescription) {
                missedFields.push('dateOfPrescription');
            }
            if (missedFields.length > 0) {
                unfulfilledTab = "clinicalTab";
            }
            return unfulfilledTab;
        }
        console.log('Missed Fields: ', missedFields);
    }
    handleCancelAfterSubmit(){
        this.showCancelModal = true;
    }

    hideModalBox(){
        this.showCancelModal = false;
    }

    handleSave() {
        this.showheader = false;
        let validaton = false;
        validaton = this.validationCheck();
        if (validaton === false) {
            this.save(true);            
        }


    }

    save(showSuccessMsg) {
        debugger
        console.log('inside save method');
        showLoader(this);
        console.log('inside save method log 2');


        let orderData = JSON.parse(JSON.stringify(this.editedData));
        console.log('Object length', Object.keys(orderData).length);


        if (Object.keys(orderData).length !== 0 && orderData.constructor === Object) {
           
            if (!orderData.patientInformation.prescriber || this.isObjectEmpty(orderData.patientInformation.prescriber)) {
                orderData.patientInformation.prescriber = null;
            }

            if (!orderData.patientInformation.emergencyContact || this.isObjectEmpty(orderData.patientInformation.emergencyContact)) {
                orderData.patientInformation.emergencyContact = null;
            }
            if (!orderData.patientInformation.primaryCarePhysician || this.isObjectEmpty(orderData.patientInformation.primaryCarePhysician)) {
                orderData.patientInformation.primaryCarePhysician = null;
            }

            let patientInformation = {
                id: this.editedData.id,
                name: this.editedData.name,
                status: this.booleanOrderStatus === true ? "Submitted To IA" : "",
                patientInformation: this.editedData.patientInformation,
            };

            console.log('Saved patientInformation', JSON.stringify(patientInformation));
            console.log('save insurance info:' + JSON.stringify(this.getInsuranceSaveData()));
            let isCreate = !patientInformation.id;
            // Save Patient Information
            saveOrder({order: patientInformation})

                .then((result) => {

                    this.recordId = result;
                    this.editedData.id = result;

                    // Save Insurance
                    let insuranceData = this.getInsuranceSaveData();
                    if (insuranceData) {
                        insuranceData.id = this.recordId;
                        console.log('insuranceData ', JSON.stringify(insuranceData));
                        saveInsurance({order: insuranceData})
                            .then((result) => {
                                console.log('Insurance Navigation check1:'+ this.isNavigate);
                                showSuccess(this, 'Order Saved', 'Order saved successfully');
                                this.isNavigate=true;
                                console.log('Insurance Navigation check2:'+ this.isNavigate);
                                console.log('Inside insurance:' + result);
                                
                                
                            })
                            .catch((error) => {
                                this.isNavigate=false;
                                console.log('order in catch block 2');
                                console.log('error:' + JSON.stringify(error));
                                hideLoader(this);
                                showReduceErrors(this, error);
                            });
                    } else {
                        if (isCreate) {
                            this.navigateToOrderPage(this.recordId);
                        } else {
                            this.getOrder();
                        }
                        hideLoader(this);
                        if (showSuccessMsg) {
                            showSuccess(this, 'Order Saved', 'Order saved successfully');
                            console.log('order getting saved 3');
                        }
                    }

                    if (this.editedData.riskFactors && this.editedData.riskFactors.slice(-1) == ';') {
                        this.editedData.riskFactors = this.editedData.riskFactors.slice(0, -1);
                    }
                    let clinicalInformationData = {
                        id: this.recordId,
                        diagnosisMap: this.editedData.diagnosisMap,
                        riskFactors: this.editedData.riskFactors,
                        riskFactorsOther: this.editedData.riskFactorsOther,
                        dateOfPrescription: this.editedData.dateOfPrescription,
                        surgeryDate: this.editedData.surgeryDate,
                        surgeryType: this.editedData.surgeryType,
                        dateOfInjury: this.editedData.dateOfInjury,
                        initialSurgery: (this.editedData.initialSurgery || []).join(';'),
                        revisionSurgeryGraftSource: (this.editedData.revisionSurgeryGraftSource || []).join(';'),
                        revisionSurgery: (this.editedData.revisionSurgery || []).join(';'),
                        initialSurgeryGraftSource: (this.editedData.initialSurgeryGraftSource || []).join(';'),
                        fractureSide: this.editedData.fractureSide,
                        fractureAffectedSite: this.editedData.fractureAffectedSite,
                        fractureType: (this.editedData.fractureType || []).join(';'),
                        fractureSite: (this.editedData.fractureSite || []).join(';'),
                        initialSurgeryDate: this.editedData.initialSurgeryDate,
                        surgeryStartingLevel: this.editedData.surgeryStartingLevel,
                        surgeryEndingLevel: this.editedData.surgeryEndingLevel,
                        multipleFusionLocations: this.editedData.multipleFusionLocations,
                        revisionDate: this.editedData.revisionDate,
                        previousTreatmentOther: this.editedData.previousTreatmentOther,
                        plannedTreatmentGraftSource: (this.editedData.plannedTreatmentGraftSource || []).join(';'),
                        fixationDate: this.editedData.fixationDate,
                        fusionDate: this.editedData.fusionDate,
                        fusionSurgeryDate: this.editedData.fusionSurgeryDate,
                        fusionSurgery: this.editedData.fusionSurgery,
                        revisionSurgeryDate: this.editedData.revisionSurgeryDate,
                        skeletallyMature: this.editedData.skeletallyMature || false,
                        greaterThan1cm: this.editedData.greaterThan1cm || false,
                        previousTreatment: (this.editedData.previousTreatment || []).join(';')
                    };

                    console.log('clinicalInformationData ', JSON.stringify(clinicalInformationData));
                    saveClinicalInformation({order: clinicalInformationData})
                        .then((result) => {
                            hideLoader(this);
                            if (isCreate) {
                                this.navigateToOrderPage(this.recordId);
                            } else {
                                this.getOrder();
                            }
                            if (showSuccessMsg) {
                                ///showSuccess(this, 'Order Saved', 'Clinical Information saved successfully');
                                console.log('order getting saved 1');
                            }
                        })
                        .catch((error) => {
                            console.log('order in catch block 1');
                            hideLoader(this);
                            showReduceErrors(this, error);

                        });
                })
                .catch((error) => {
                    console.log('order in catch block 3');
                    console.log(error);
                    console.log(error.body);
                    if (error.body) {
                        console.log(error.body.message);
                    }

                    hideLoader(this);
                    showReduceErrors(this, error);
                });
        } else {
            LightningConfirm.open({
                message: 'The form has empty data',
                variant: 'headerless',
                label: 'create Order',

            });
            setTimeout(() => {
                window.location.reload();
            }, 6000);
        }

        return this.isNavigate;
    }

    navigateToOrderPage(recordId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Order',
                actionName: 'view'
            },
        });
    }


    handleSaveAndSubmit() {

        let missedFields = this.validateData();
        console.log('missedFields', JSON.stringify(missedFields));
        if (missedFields.length > 0) {
            showError(this, 'Validation Error', 'Please enter all required fields');
            return;
        }
        showLoader(this);
        this.save(false);
        showLoader(this);

        console.log('saveAndSubmit 1');
        const self = this;
        setTimeout(function () {
            console.log('saveAndSubmit 2');
            self.saveAndSubmit();
        }, 2000);

    }

    prepareEventData(editedData) {
        console.log('editedData.eventInformation.appointmentdate', editedData.eventInformation);
        if(editedData.eventInformation && editedData.eventInformation.appointmentdate && editedData.eventInformation !== undefined){
        const startDateTime = editedData.eventInformation.appointmentdate;
        console.log('startDateTime', startDateTime);
        let locationString = '';
        if (editedData.eventInformation.street) {
            locationString += `${editedData.eventInformation.street}, `;
        }
        if (editedData.eventInformation.city) {
            locationString += `${editedData.eventInformation.city}, `;
        }
        if (editedData.eventInformation.province) {
            locationString += `${editedData.eventInformation.province}, `;
        }
        if (editedData.eventInformation.country) {
            locationString += `${editedData.eventInformation.country}, `;
        }
        if (editedData.eventInformation.postalCode) {
            locationString += `${editedData.eventInformation.postalCode}`;
        }
        return {
            WhatId: editedData.id,
            StartDateTime: startDateTime,
            Location: locationString,
            // Location: `${editedData.eventInformation.street}, ${editedData.eventInformation.city}, ${editedData.eventInformation.province}, ${editedData.eventInformation.country}, ${editedData.eventInformation.postalCode}`,
            Description: editedData.eventInformation.notes,
        };
        }else {
            showError(this, 'Validation Error', 'Please enter appointment date and time to submit');
        }
    }


    handleSubmitSchAppointment() {
        let eventData = this.prepareEventData(this.editedData);

        showLoader(this);
        if (this.editedData && this.editedData.eventInformation) {
            console.log('eventData', eventData);
            createEvent({eventData})
                .then(result => {
                    hideLoader(this);
                    showSuccess(this, 'Event Created', 'Event saved successfully');
                    this.makeEventReadOnly = true;
                    this.showSubmit = false;
                    const scheduleAppointmentTabComp = this.template.querySelector('c-orthofix-order-form-schedule-appointment');
                    if (scheduleAppointmentTabComp) {
                        console.log('inside shecudle appoint comp');
                        scheduleAppointmentTabComp.scheduleHeaderfun();
                    }
                })
                .catch(error => {
                    hideLoader(this);
                    console.error('Error creating event:', error);
                    this.makeEventReadOnly = false;
                    showReduceErrors(this, error);
                });
        }


    }


    handleListViewNavigation() {
        window.location.href = 'https://demoargano--orthodev.sandbox.lightning.force.com/lightning/page/home';
    }

    saveAndSubmit() {

        console.log('saveAndSubmit');

        let orderData = JSON.parse(JSON.stringify(this.editedData));

        if (!orderData.patientInformation.altContact || this.isObjectEmpty(orderData.patientInformation.altContact)) {
            orderData.patientInformation.altContact = null;
        }
        if (!orderData.patientInformation.prescriber || this.isObjectEmpty(orderData.patientInformation.prescriber)) {
            orderData.patientInformation.prescriber = null;
        }
        if (!orderData.patientInformation.emergencyContact || this.isObjectEmpty(orderData.patientInformation.emergencyContact)) {
            orderData.patientInformation.emergencyContact = null;
        }
        if (!orderData.patientInformation.primaryCarePhysician || this.isObjectEmpty(orderData.patientInformation.primaryCarePhysician)) {
            orderData.patientInformation.primaryCarePhysician = null;
        }

        let insuranceData = this.getInsuranceSaveData();
        if (!insuranceData) {
            orderData.primary = null;
            orderData.secondary = null;
            orderData.tertiary = null;
            orderData.quaternary = null;
        } else {
            orderData.primary = insuranceData.primary ? insuranceData.primary : null;
            orderData.secondary = insuranceData.secondary ? insuranceData.secondary : null;
            orderData.tertiary = insuranceData.tertiary ? insuranceData.tertiary : null;
            orderData.quaternary = insuranceData.quaternary ? insuranceData.quaternary : null;
        }

        console.log('Saved order', JSON.stringify(orderData));

        submitAndSave({order: orderData})
            .then((result) => {

                this.recordId = result;
                showSuccess(this, 'Order Saved', 'Order saved successfully');
                this.handleListViewNavigation();

            })
            .catch((error) => {
                hideLoader(this);
                showReduceErrors(this, error);
            });
    }


    getInsuranceSaveData() {
        let insuranceData = {};

        this.checkInsuranceItem(insuranceData, 'primary', 'carrier');
        this.checkInsuranceItem(insuranceData, 'primary', 'insured');

        this.checkInsuranceItem(insuranceData, 'secondary', 'carrier');
        this.checkInsuranceItem(insuranceData, 'secondary', 'insured');

        this.checkInsuranceItem(insuranceData, 'tertiary', 'carrier');
        this.checkInsuranceItem(insuranceData, 'tertiary', 'insured');

        this.checkInsuranceItem(insuranceData, 'quaternary', 'carrier');
        this.checkInsuranceItem(insuranceData, 'quaternary', 'insured');

        if (this.isObjectEmpty(insuranceData)) {
            return null;
        }
        return insuranceData;

    }

    checkInsuranceItem(insuranceData, objectName, innerObjectName) {
        if (this.editedData[objectName] && !this.isObjectEmpty(this.editedData[objectName][innerObjectName])) {
            if (!insuranceData[objectName]) {
                //insuranceData[objectName] = {};
                insuranceData[objectName] = {
                    id: this.editedData[objectName].id ? this.editedData[objectName].id : null,
                    insuranceType: this.editedData[objectName].insuranceType
                };
            }
            insuranceData[objectName][innerObjectName] = this.editedData[objectName][innerObjectName];
        }
    }

    isObjectEmpty(obj) {
        return Object.keys(obj).length <= 0;
    }

    async checkIfPrescriberIsFavorite() {
        console.log(new Date().getTime() - this.lastTimeCheckFavoriteRequested >= 500);
        if (new Date().getTime() - this.lastTimeCheckFavoriteRequested >= 500) {
            if (!this.editedData.patientInformation.prescriber.isFavorite) {
                this.editedData.patientInformation.prescriber.isFavorite = await isFavorite({physitian: this.editedData.patientInformation.prescriber});
                this.showAddFavoriteButton = !this.editedData.patientInformation.prescriber.isFavorite;
                console.log(this.showAddFavoriteButton);
            } else {
                this.showAddFavoriteButton = false;
            }
        } else {
            console.log('User still typing waiting');
        }
    }

    async checkIfInsuranceIsFavorite(detail) {
        if (new Date().getTime() - this.lastTimeCheckFavoriteRequested >= 500) {
            if (!this.editedData.primary.isFavorite || !this.editedData.secondary.isFavorite || !this.editedData.tertiary.isFavorite || !this.editedData.quaternary.isFavorite) {

                if (detail.fieldName === 'primary.carrier.name' || detail.fieldName === 'primary.insuranceType') {
                    this.editedData.primary.isFavorite = await isFavoriteInsurance({insurance: this.editedData.primary});
                    this.showAddFavoriteInsuranceButton = !this.editedData.primary.isFavorite;
                } else if (detail.fieldName === 'secondary.carrier.name' || detail.fieldName === 'secondary.insuranceType') {
                    this.editedData.secondary.isFavorite = await isFavoriteInsurance({insurance: this.editedData.secondary});
                    this.showAddFavoriteInsuranceButton = !this.editedData.secondary.isFavorite;
                } else if (detail.fieldName === 'tertiary.carrier.name' || detail.fieldName === 'tertiary.insuranceType') {
                    this.editedData.tertiary.isFavorite = await isFavoriteInsurance({insurance: this.editedData.tertiary});
                    this.showAddFavoriteInsuranceButton = !this.editedData.tertiary.isFavorite;

                } else if (detail.fieldName === 'quaternary.carrier.name' || detail.fieldName === 'quaternary.insuranceType') {
                    this.editedData.quaternary.isFavorite = await isFavoriteInsurance({insurance: this.editedData.quaternary});
                    this.showAddFavoriteInsuranceButton = !this.editedData.quaternary.isFavorite;

                }
                console.log(this.showAddFavoriteInsuranceButton);
            } else {
                this.showAddFavoriteInsuranceButton = false;
            }
        } else {
            console.log('User still typing waiting');
        }
    }

    handleAddFavoritesButton(detail) {
        const favFields = ['patientInformation.prescriber.firstName', 'patientInformation.prescriber.lastName', 'patientInformation.prescriber.npi'];
        if (favFields.includes(detail.fieldName)) {
            console.log('Fav tracking field changed', detail.fieldName);
            if (!!this.editedData.patientInformation.prescriber.firstName && !!this.editedData.patientInformation.prescriber.lastName && !!this.editedData.patientInformation.prescriber.npi) {
                console.log('All fields populated starting countdown');
                this.lastTimeCheckFavoriteRequested = (new Date().getTime());
                setTimeout(async () => {
                    await this.checkIfPrescriberIsFavorite()
                }, 500);
            }
        }
    }

    handleAddFavoritesInsuranceButton(detail) {
        const favInsurance = ['primary.carrier.name', 'primary.insuranceType', 'secondary.carrier.name', 'secondary.insuranceType', 'tertiary.carrier.name', 'tertiary.insuranceType', 'quaternary.carrier.name', 'quaternary.insuranceType',];
        if (favInsurance.includes(detail.fieldName)) {

            console.log('check add fav insurance');
            if ((!!this.editedData.primary?.insuranceType && !!this.editedData.primary?.carrier?.name) ||
                (!!this.editedData.secondary?.insuranceType && !!this.editedData.secondary?.carrier?.name) ||
                (!!this.editedData.tertiary?.insuranceType && !!this.editedData.tertiary?.carrier?.name) ||
                (!!this.editedData.quaternary?.insuranceType && !!this.editedData.quaternary?.carrier?.name)) {
                console.log('All fields populated starting countdown insurance');
                this.lastTimeCheckFavoriteRequested = (new Date().getTime());
                setTimeout(async () => {
                    await this.checkIfInsuranceIsFavorite(detail)
                }, 500);
            }
        }
    }

    handleGenericInputChange(event) {
        console.log('input data:' + JSON.stringify(event.detail));
        let detail = event.detail;
        let arr = detail.fieldName.split('.');
        this.editedData[detail.fieldName] = detail.value;
        if (arr.length == 1) {
            this.editedData[detail.fieldName] = detail.value;
        } else if (arr.length == 3) {
            let tabName = arr[0];
            let innerObjectName = arr[1];
            let fieldName = arr[2];
            let changedItem = {[fieldName]: detail.value};
            if (fieldName === "socialSecurityNumber" && detail.value.trim() != '') {

            }
            if (!this.editedData[tabName]) {
                this.editedData[tabName] = {};
            }
            if (!this.editedData[tabName][innerObjectName]) {
                this.editedData[tabName][innerObjectName] = {};
            }
            this.editedData[tabName][innerObjectName] = {...this.editedData[tabName][innerObjectName], ...changedItem};
        } else {
            let tabName = arr[0];
            let fieldName = arr[1];
            let changedItem = {[fieldName]: detail.value};
            this.editedData[tabName] = {...this.editedData[tabName], ...changedItem};
            if (fieldName == "productType") {
                this.formData.patientInformation.productType = detail.value;
            }
            if (fieldName === "productType") {
                if (typeof this.formData.patientInformation.firstName === 'undefined' && typeof this.formData.patientInformation.lastName === 'undefined') {
                    console.log('come here it is undefined   ');

                    this.headerText = `Create Order: ${this.productType}™`;
                    // this.headerText = 'Create Order: ' + changedItem.productType+'TM';
                } else {
                    console.log('come here it in undefined   ');
                    console.log('this.formData.patientInformation.firstName   ' + JSON.stringify(this.formData.patientInformation.firstName))
                    console.log('this.formData.patientInformation.lastnae   ' + JSON.stringify(this.formData.patientInformation.lastName))


                    //this.headerText = `Create Order: ${this.productType}™` + ' - ' + this.formData.patientInformation.firstName + ' ' + this.formData.patientInformation.lastName;
                }
            }
            if (fieldName === "firstName") {
                this.firstName = changedItem['firstName'];
                if (this.formData.patientInformation.lastName === 'undefined') {
                    this.headerText = `Create Order: ${this.productType}™` + ' - ' + this.firstName;
                } else {
                    this.headerText = `Create Order: ${this.productType}™` + ' - ' + this.firstName;
                    //+ ' ' + this.formData.patientInformation.lastName;
                }
            }
            if (fieldName === "lastName") {
                this.lastName = changedItem['lastName']
                if (this.formData.patientInformation.firstName === 'undefined') {
                    this.headerText = `Create Order: ${this.productType}™` + ' - ' + this.lastName;
                } else {
                    this.headerText = `Create Order: ${this.productType}™` + ' - ' + this.firstName + ' ' + this.lastName;
                }
            }
            
            //type 
            if (fieldName === 'insuranceType' && detail.value === 'Self-Pay') {
                this.requiredFields["insurance"]["carrier"]["name"] = false;
                this.requiredFields["insurance"]["insured"]["policyNo"] = false;
                console.log('self-pay:' + JSON.stringify(this.requiredFields["insurance"]["carrier"]["name"]));
            } else {
                this.requiredFields["insurance"]["carrier"]["name"] = true;
                this.requiredFields["insurance"]["insured"]["policyNo"] = true;
            }
            if (fieldName === 'insuranceType' && (detail.value === 'Workers Compensation' || detail.value === 'Medicaid' || detail.value === 'Medicare' || detail.value === 'Self-Pay' || detail.value === 'HMO (Commercial)' || detail.value === 'Other Government')) {
                this.requiredFields["insurance"]["carrier"]["phone"] = false;
                this.requiredFields["insurance"]["insured"]["groupNumber"] = false;
            } else {
                this.requiredFields["insurance"]["carrier"]["phone"] = true;
                this.requiredFields["insurance"]["insured"]["groupNumber"] = true;
            }
            if (fieldName === 'insuranceType' && detail.value === 'Workers Compensation') {
                this.requiredFields["insurance"]["insured"]["employer"] = true;
                this.requiredFields["insurance"]["insured"]["insuranceContact"] = true;
                this.requiredFields["attorneyVisibleFields"]["nurseCaseManager"] = true;
            } else {
                this.requiredFields["insurance"]["insured"]["employer"] = false;
                this.requiredFields["insurance"]["insured"]["insuranceContact"] = false;
                this.requiredFields["attorneyVisibleFields"]["nurseCaseManager"] = false;
            }
            if (fieldName === 'insuranceType' && detail.value === 'Auto Liability') {
                console.log('Edited dataa:' + detail.value);
                this.requiredFields["attorneyVisibleFields"]["attorneyNamePhone"] = true;
            } else {
                this.requiredFields["attorneyVisibleFields"]["attorneyNamePhone"] = false;
            }
        }
        this.handleAddFavoritesButton(detail);
        this.handleAddFavoritesInsuranceButton(detail);
        console.log('editedData', JSON.stringify(this.editedData));
    }

   

    handleDiagnosisInputChange(event) {
        let detail = event.detail;
        let diagnosisType = detail.diagnosisType;
        let diagnosisItem = detail.diagnosisItem;

        if (!this.editedData.diagnosisMap) {
            this.editedData.diagnosisMap = {};
        }

        if (diagnosisItem.active) {
            if (!this.editedData.diagnosisMap[diagnosisType]) {
                this.editedData.diagnosisMap[diagnosisType] = detail.diagnosisItem;
            } else {
                let existingItem = this.editedData.diagnosisMap[diagnosisType];
                this.editedData.diagnosisMap[diagnosisType] = {...existingItem, ...diagnosisItem};
            }
        } else {
            delete this.editedData.diagnosisMap[diagnosisType];
        }
    }

    handleMultiSelectChange(event) {
        console.log(JSON.stringify(event.detail));
        if (!this.editedData[event.detail.name]) {
            this.editedData[event.detail.name] = [];
        }

        if (event.detail.value) {
            this.editedData[event.detail.name].push(event.detail.option);
        } else {
            this.editedData[event.detail.name] = this.editedData[event.detail.name].filter(x => x !== event.detail.option)
        }
    }


    handleRiskfactorsInputChange(event) {
        let riskFactorsItem = event.detail;

        if (!this.editedData.riskFactors) {
            this.editedData.riskFactors = '';
        }

        let riskfactorsKey = '';
        let riskfactorsVal = '';
        for (let key in riskFactorsItem) {
            let val = riskFactorsItem[key];
            riskfactorsKey = key + ';';
            if (val) {
                riskfactorsVal = val;
            }
        }
        let riskfactorsKeyWithoutSufix = riskfactorsKey.slice(0, -1);

        if (this.editedData.riskFactors && this.editedData.riskFactors.slice(-1) != ';') {
            this.editedData.riskFactors += ';';
        }

        if (this.editedData.riskFactors.includes(riskfactorsKey)) {
            this.editedData.riskFactors = this.editedData.riskFactors.replace(riskfactorsKey, riskfactorsVal);
        } else if (this.editedData.riskFactors.includes(riskfactorsKeyWithoutSufix)) {
            if (riskfactorsVal) {
                riskfactorsVal = riskfactorsVal.slice(0, -1);
            }
            this.editedData.riskFactors = this.editedData.riskFactors.replace(riskfactorsKeyWithoutSufix, riskfactorsVal);
        } else {
            this.editedData.riskFactors += riskfactorsKey;
        }
    }


    data = {
        patientInformation: {
            productType: null,
            territoryManager: null,
            firstName: null,
            lastName: null,
            gender: null,
            birthDate: null,
            address2: null,
            phone: null,
            street: null,
            city: null,
            province: null,
            postalCode: null,
            country: null,
            phonetype: null,
            emergencyContact: {
                name: null,
                relationship: null,
                phone: null,
                extension: null,
            },
            altContact: {
                name: null,
                phone: null,
                nameLocation: null,
                altPhone: null,
            },
            prescriber: {
                favPhysician: null,
                firstName: null,
                lastName: null,
                npi: null,
                licence: null,
                address2: null,
                phone: null,
                street: null,
                city: null,
                province: null,
                postalCode: null,
                country: null
            },
            primaryCarePhysician: {
                name: null,
                npi: null,
                phone: null,
                fax: null,
                refferalcoordinator: null

            },

        }
    };

    validateData() {
        //this.validateData('patientInformation', 'patientInformation')
        console.log('validateData');
        let missedFields = [];

        if (!this.editedData.patientInformation) {
            missedFields.push('patientInformation');
            return missedFields;
        } else {
            if (this.editedData.patientInformation.productType == 'AccelStim' || this.editedData.patientInformation.productType == 'PhysioStim') {
                if (!this.editedData.dateOfInjury) {
                    missedFields.push('dateOfInjury');
                    return missedFields;
                }
            }
            if (this.editedData.patientInformation.productType == 'CervicalStim' || this.editedData.patientInformation.productType == 'SpinalStim') {
                if (!this.editedData.surgeryType) {
                    missedFields.push('surgeryType');
                    return missedFields;
                }
                if (!this.editedData.surgeryDate) {
                    missedFields.push('surgeryDate');
                    return missedFields;
                }
            }
            if (!this.editedData.dateOfPrescription) {
                missedFields.push('dateOfPrescription');
                return missedFields;
            }
        }

        let patientInformation = this.validateItem(this.requiredFields.patientInformation, this.editedData, 'patientInformation');
        missedFields = [...missedFields, ...patientInformation];

        let prescriber = this.validateItem(this.requiredFields.patientInformation.prescriber, this.editedData.patientInformation, 'prescriber');
        missedFields = [...missedFields, ...prescriber];

        let insurancePrimary = this.validateInsuranceItem('primary');
        missedFields = [...missedFields, ...insurancePrimary];
        console.log('insurancePrimary', JSON.stringify(insurancePrimary));

        let insuranceSecondary = this.validateInsuranceItem('secondary');
        missedFields = [...missedFields, ...insuranceSecondary];
        console.log('insuranceSecondary', JSON.stringify(insuranceSecondary));

        let insuranceTertiary = this.validateInsuranceItem('tertiary');
        missedFields = [...missedFields, ...insuranceTertiary];
        console.log('insuranceTertiary', JSON.stringify(insuranceTertiary));

        let insuranceQuaternary = this.validateInsuranceItem('quaternary');
        missedFields = [...missedFields, ...insuranceQuaternary];
        console.log('insuranceQuaternary', JSON.stringify(insuranceQuaternary));

        console.log('missed fields1', missedFields);
        return missedFields;
    }

    validateItem(requiredNode, editDataNode, nodeName) {
        let missedFields = [];
        if (!editDataNode || !editDataNode[nodeName]) {
            missedFields.push(nodeName);
            return missedFields;
        }
        for (let key in requiredNode) {
            let val = requiredNode[key];
            let type = typeof val;
            if (type == 'boolean' && val && (!editDataNode[nodeName][key] || editDataNode[nodeName][key] == '')) {
                missedFields.push(key);
            }
        }
        return missedFields;
    }

    validateInsuranceItem(insuranceName) {
        let requiredNode = this.requiredFields.insurance;
        let editDataNode = this.editedData;
        let missedFields = [];

        console.log('log 0.1');
        if (insuranceName != 'primary' && (!editDataNode || this.isObjectEmpty(editDataNode) || !editDataNode[insuranceName] || this.isObjectEmpty(editDataNode[insuranceName]))) {
            return missedFields;
        }
        console.log('log 0.2');
        if (insuranceName == 'primary' && !editDataNode || this.isObjectEmpty(editDataNode)) {
            missedFields.push('editDataNode');
            return missedFields;
        }
        console.log('log 0.3');
        if (!editDataNode || !editDataNode[insuranceName]) {
            missedFields.push(insuranceName);
            return missedFields;
        }
        console.log('insuranceName ', insuranceName);
        console.log('typeof ', (typeof editDataNode[insuranceName].isOpen));
        console.log('id ', editDataNode[insuranceName].id);
        if ((insuranceName == 'primary' || ((typeof editDataNode[insuranceName].isOpen) == 'undefined' && editDataNode[insuranceName].id) || (editDataNode[insuranceName].isOpen || editDataNode[insuranceName].id))) {
            console.log('log 1');
            for (let key in requiredNode.carrier) {
                console.log('log 1.1');
                let val = requiredNode.carrier[key];
                console.log('log 1.2');
                let type = typeof val;
                console.log('log 1.3');
                if (type == 'boolean' && val) {
                    console.log('log 1.4');
                    if ((!editDataNode[insuranceName]['carrier'] || !editDataNode[insuranceName]['carrier'][key] || editDataNode[insuranceName]['carrier'][key] == '')) {
                        console.log('log 1.5');
                        missedFields.push(key);
                    }
                }
            }
            console.log('log 2');
            for (let key in requiredNode.insured) {
                console.log('log 2.1');
                let val = requiredNode.insured[key];
                console.log('log 2.2');
                let type = typeof val;
                console.log('log 2.3');
                if (type == 'boolean' && val) {
                    console.log('log 2.4');
                    if ((!editDataNode[insuranceName]['insured'] || !editDataNode[insuranceName]['insured'][key] || editDataNode[insuranceName]['insured'][key] == '')) {

                        console.log('log 2.5');
                        missedFields.push(key);
                    }
                }
            }
        }
        console.log('log missedFields', missedFields);
        return missedFields;
    }

   


    getPicklistOptions() {
        getPicklistValues()
            .then((result) => {
                this.picklistOptions.productTypes = result.productTypes;
                this.picklistOptions.genders = result.genders;
                this.picklistOptions.surgeryTypes = result.surgeryTypes;
                this.picklistOptions.favoriteInsurances = result.favoriteInsurances;
                this.picklistOptions.diagnosisStarts = result.diagnosisStarts;
                this.picklistOptions.diagnosisEnds = result.diagnosisEnds;
                this.picklistOptions.diagnosisgrade = result.diagnosisgrade;
                this.picklistOptions.insuranceTypes = result.insuranceTypes;
                this.picklistOptions.favoritePhysicians = result.favoritePhysicians;
                this.picklistOptions.territoryManagers = result.territoryManagers;
                this.picklistOptions.patientRelationships = result.patientRelationships;
                this.picklistOptions.favoriteInsurances = result.favoriteInsurances;
                this.picklistOptions.diagnosisTypes = result.diagnosisTypes;
                this.picklistOptions.phonetype = result.phonetype;
                this.picklistOptions.initialsurgery = result.initialsurgery;
                this.picklistOptions.initialsurgerygraftsource = result.initialsurgerygraftsource;
                this.picklistOptions.revisionsurgerygraftsource = result.revisionsurgerygraftsource;
                this.picklistOptions.revisionsurgery = result.revisionsurgery;
                this.picklistOptions.fracturetype = result.fracturetype;
                this.picklistOptions.fractureaffectedsite = result.fractureaffectedsite;
                this.picklistOptions.fractureside = result.fractureside;
                this.picklistOptions.fracturesite = result.fracturesite;
                this.picklistOptions.previoustreatment = result.previoustreatment;
                this.picklistOptions.startinglevel = result.startinglevel;
                this.picklistOptions.endinglevel = result.endinglevel;
                this.picklistOptions.assignment = result.assignment;
                this.picklistOptions.doctype = result.doctype;
                this.picklistOptions.otherdoctype = result.otherdoctype;

                

                if(this.picklistOptions.territoryManagers.length > 0){
                    console.log('inside condition');
                    this.requiredFields["patientInformation"]["territoryManager"] = true;
                }
            })
            .catch((error) => {
                showReduceErrors(this, error);
            });
    }

    validationCheck() {
        let validation = false;

        if (this.editedData.hasOwnProperty('primary')) {
            let carrierPhone = this.editedData.primary.carrier.phone;
            let SSN = this.editedData.primary.insured.socialSecurityNumber;
            let birthDate = this.editedData.primary.insured.birthDate;
            let date = new Date();
            let date1 = JSON.stringify(date);
            date1 = date1.slice(1, 11);
            console.log('current date:' + date1);
            if (this.editedData.primary?.carrier?.hasOwnProperty('phone') && carrierPhone != "" && !carrierPhone.match("[0-9]{3}-[0-9]{3}-[0-9]{4}$")) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Please Enter valid phone number',
                        variant: 'error'
                    }),
                );
                validation = true;
            } else if (this.editedData.primary?.insured?.hasOwnProperty('socialSecurityNumber') && SSN != "" && !SSN.match("[0-9]{3}-[0-9]{2}-[0-9]{4}$")) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Please Enter valid SSN number',
                        variant: 'error'
                    }),
                );
                validation = true;
            } else if (this.editedData.primary?.insured?.hasOwnProperty('birthDate') && birthDate != "" && birthDate > date1) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Birth Date should not be greater than current date',
                        variant: 'error'
                    }),
                );
                validation = true;
            }
        }
        return validation;
    }

    get productType() {
        if (this.editedData && this.editedData.patientInformation && this.editedData.patientInformation.productType) {
            return this.editedData.patientInformation.productType;
        }
        return '';
    }

    handleTabClick(event) {
        let tab = event.currentTarget;
        this.deactivatePreviousTab();
        this.activateNewTab(tab);
    }

    activateNewTab(tab) {
        let tabChild = tab.childNodes[0];
        tab.classList.add('slds-is-active');
        tabChild.tabIndex = "0";
        console.log('>>> tabChild.id', tabChild.id);
        let controlledAria = this.template.querySelector(`[aria-labelledby="${tabChild.id}"]`);
        controlledAria.classList.replace('slds-hide', 'slds-show');
    }

    deactivatePreviousTab() {
        let activeTab = this.activeTab;
        console.log('>>> activeTab', activeTab);
        activeTab.classList.remove('slds-is-active');
        let activeTabChild = activeTab.childNodes[0];
        activeTabChild.tabIndex = "-1";
        let controlledAria = this.template.querySelector(`[aria-labelledby="${activeTabChild.id}"]`);
        console.log('>>> activeTabChild.id', activeTabChild.id);
        controlledAria.classList.replace('slds-show', 'slds-hide');
    }

    get activeTab() {
        return this.template.querySelector('.slds-is-active')[0];
    }

    // renderedCallback(){
    //     this.handleTabsValidation();
    // }
    
}


// function setObserver(el) {
//   const observer = new IntersectionObserver(
//     ([e]) => {e.target.classList.toggle("is-pinned", e.intersectionRatio < 1)},
//     {
//       threshold: [1],
//     }
//   );
//   observer.observe(el);
// }

// const orderFormTitle = document.querySelector(".comm-content-header");
// setObserver(orderFormTitle);