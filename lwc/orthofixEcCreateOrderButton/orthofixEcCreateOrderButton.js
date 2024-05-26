import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class OrthofixCreateOrderButton extends NavigationMixin(LightningElement)  {

    handleCreateOrder(event) {

        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'CreateOrder__c'
            }
        });

    }

}