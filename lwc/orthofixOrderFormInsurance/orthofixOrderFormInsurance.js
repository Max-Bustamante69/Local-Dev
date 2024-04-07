/**
 * Created by davitshonia on 5/16/23.
 */

import {api, LightningElement} from 'lwc';

export default class OrthofixOrderFormInsurance extends LightningElement {

    @api formData;
    @api picklistOptions;
    @api requiredFields;
    @api editedData; 
    @api showAddFavoriteInsuranceButton;
    @api disableForm;
}