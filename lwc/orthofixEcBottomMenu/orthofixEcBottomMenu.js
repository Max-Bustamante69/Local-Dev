import { LightningElement, api } from 'lwc';

export default class OrthofixEcBottomMenu extends LightningElement {

    @api
    appName = 'STIM CONNECT';

    @api
    insightReportUrl = 'https://orthofix.com';

    @api
    privacyPolicyUrl = 'https://orthofix.com';

    @api
    contactUsUrl = 'https://orthofix.com';

    menuItems = [{
        id: 1,
        label: 'Insight Report'}];

    onMenuItemSelect(e) {
        let navigateToMenuItem = this.menuItems.filter( item => 
            item.id == e.currentTarget.dataset.id
        );
        this.menuItemSelectExecutor(navigateToMenuItem[0]);
    }

    menuItemSelectExecutor(menuItem) {

        let url = 'https://orthofix.com';
        switch(menuItem.id) {
            case 1: {
                window.open(this.insightReportUrl, '_Blank');
                break;
            }
            case 2: {
                window.open(this.privacyPolicyUrl, '_Blank');
                break;
            }
            case 3: {
                window.open(`mailto:${this.contactUsUrl}`, '_Blank');
                break;
            }
            default: {
                window.open(url, '_Blank');
            }
        }
    }

}