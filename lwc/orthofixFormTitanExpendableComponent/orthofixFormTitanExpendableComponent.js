/**
 * @description       : 
 * @author            : manish.tyagi@argano.com
 * @group             : 
 * @last modified on  : 03-27-2024
 * @last modified by  : manish.tyagi@argano.com
**/
import { LightningElement, api, track } from 'lwc';

export default class OrthofixFormTitanExpendableComponent extends LightningElement {
    @api id;
    @api label;
    @api applycss;
    @api applyiconcss;

    toggleSection(event) {
        let buttonid = event.currentTarget.dataset.buttonid;
        let currentsection = this.template.querySelector('[data-id="' + buttonid + '"]');
        if (currentsection.className.search('slds-is-open') == -1) {
            currentsection.className = 'slds-section slds-is-open';
        } else {
            currentsection.className = 'slds-section slds-is-close';
        }
    }
}