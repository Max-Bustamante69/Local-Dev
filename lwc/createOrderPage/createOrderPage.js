/**
 * @description       :
 * @author            : Lokesh Kesava | lokesh.kesava@argano.com
 * @group             :
 * @last modified on  : 03-11-2024
 * @last modified by  : Lokesh Kesava | lokesh.kesava@argano.com
 **/
import {LightningElement, api, track,} from 'lwc';
import {NavigationMixin} from 'lightning/navigation';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import getPicklistValues from "@salesforce/apex/OrthoFixOrderFormController.getPicklistValues";
import getShippingAddresses from "@salesforce/apex/OrderController.getTMAdddresses";



export default class CreateOrderPage extends NavigationMixin(LightningElement) {
    @api objectName = "Order";
    @api selectedRecordType;
    @api selectedRecordTypeName;
    @api flexipageRegionWidth;
    modalHeader = `Create New Order`;
    //createdRecordId;
    @track territoryManagerPicklistOptions = [];
    @track shippingAddresses = [];
    @track shippingMethods = [];

    uiRecordToDisplay;
    showSections;
    activeSectionNames = [];

    connectedCallback() {

        this.loadTerritoryManagers().catch(console.error);
    }

    async loadTerritoryManagers() {
        let [picklistValues, addresses] = await Promise.all([getPicklistValues(), getShippingAddresses()]);
        this.territoryManagerPicklistOptions = picklistValues['territoryManagers'];
        this.shippingAddresses = addresses;
        this.shippingMethods = picklistValues['shippingmethod']

        console.log('--------------', JSON.stringify(picklistValues));
        console.log('--------------', JSON.stringify(this.shippingMethods));
        console.log('--------------', JSON.stringify(this.territoryManagerPicklistOptions));
        console.log('--------------', JSON.stringify(this.shippingAddresses));
    }

    handleLoad(event) {


        let layoutParse = JSON.parse(JSON.stringify(Object.values(event.detail.layout.sections)));


        this.uiRecordToDisplay = Object.values(layoutParse);


        // Get the Section headers from the layout. Populate activeSectionNames so the accordion will have the tabs open when it loads.
        for (const tabs of layoutParse) {
            this.activeSectionNames.push(tabs.id);
        }

        this.showRow();
    }

    showRow() {
        let forData = this.uiRecordToDisplay


        for (const sec of forData) {
            sec.showSection = false;
            for (const lr of Object.values(sec.layoutRows)) {

                for (const li of Object.values(lr.layoutItems)) {

                    for (const l of Object.values(li.layoutComponents)) {
                        l.showField = true;
                        sec.showSection = true;
                    }
                }
            }
        }


        this.uiRecordToDisplay = forData;

    }

    handleSuccess(event) {
        const createdRecordId = event.detail.id;
        console.log('createdRecordId', createdRecordId);
        const evt = new ShowToastEvent({
            title: 'Order Created',
            message: 'Order was sucessfully created',
            variant: 'success',

        });

        this.dispatchEvent(evt);

        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
                objectApiName: this.objectName,
                actionName: "view",
                recordId: createdRecordId
            }
        });


    }

    handleError(event) {
        const updatedRecordError = event.detail;
    }

    handleEditClickCancel() {
        const event = new CustomEvent('cancel')
        this.dispatchEvent(event);

    }


    handleListViewNavigation() {

        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: this.objectName,
                actionName: 'list'
            },
            state: {
                filterName: 'Recent'
            }
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        const fields = event.detail.fields;
        this.template.querySelector('lightning-record-edit-form').submit(fields);
    }
}