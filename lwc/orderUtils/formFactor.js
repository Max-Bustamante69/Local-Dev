import { LightningElement} from 'lwc';
import FORM_FACTOR from '@salesforce/client/formFactor';

const resolution = (largeScreen, mediumScreen, smallScreen) => {
        switch(FORM_FACTOR) {
            case 'Large':
            return largeScreen;
            case 'Medium':
            return mediumScreen;
            case 'Small':
            return smallScreen;
            default:
        }
};
export {resolution}