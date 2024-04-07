/**
 * Created by davitshonia on 5/11/23.
 */

import {track, api, LightningElement, wire} from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getRecordTypes from '@salesforce/apex/RecordTypesController.getRecordTypes';

const OBJECT_API_NAME = 'Order'; 


export default class OrthofixContainer extends NavigationMixin(LightningElement) {

    @api
    recordId;
    showModal = true;
    loaderStatus = false;
    showPatientOrderComp = false;
    ShowCreateForm=false;
    selectedRecordTypeName;
    selectedRecordTypeId;
    recordTypeOptions;
    selectedRecordTypeDeveloperName;
    showWholeSaleOrderComp = false;



    @wire(getRecordTypes, { objectApiName: OBJECT_API_NAME })
    wiredRecordTypes({ error, data }) {
        if (data) {
            this.recordTypes = data;
            this.recordTypeOptions = this.generateOptions();
           
        } else if (error) {
            console.error(`Error fetching record types for ${OBJECT_API_NAME}:`, error);
        }
    }

    generateOptions() {
        return this.recordTypes.map(rt => ({
            label: `${rt.name}`,
            value: rt.recordTypeId,
            recordTypeName: rt.name,
            recordTypeDeveloperName: rt.developerName
        }));
    }

   

    handleShowLoader(event){
        this.showLoader();
    }
    handleHideLoader(event){
        this.hideLoader();
    }

    showLoader(event){
        this.loaderStatus = true;
    }
    hideLoader(event){
        this.loaderStatus = false;
    }


    handleCancel() {
        this.showModal = false;
         this.ShowCreateForm = false;
          this.showPatientOrderComp = false;
        this.handleListViewNavigation();
    }

    handleNext(event) {
         this.selectedRecordTypeName = event.detail.recordTypename;
         this.selectedRecordTypeDeveloperName = event.detail.recordTypeDeveloperName;
        
         
        this.selectedRecordTypeId = event.detail.recordTypeId;
        

         this.showModal = false;
           switch (this.selectedRecordTypeDeveloperName) {
            case 'Patient_3PP':
                this.showPatientOrderComp = true;
                this.ShowCreateForm = false;
                break;

            case 'Wholesale':
                this.showWholeSaleOrderComp = true;
                this.showPatientOrderComp = false;
                this.ShowCreateForm = false;
                break;
            case 'Inventory':
                this.showPatientOrderComp = false;
                this.ShowCreateForm = true;
                break;
            }  
    }

    handleListViewNavigation() {
        // Navigate to the Accounts object's Recent list view.
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: OBJECT_API_NAME,
                actionName: 'list'
            },
            state: {
                filterName: 'Recent' 
            }
        });
    }
}