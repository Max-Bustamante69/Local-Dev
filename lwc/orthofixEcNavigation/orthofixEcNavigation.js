import { LightningElement } from 'lwc';

export default class OrthofixEcNavigation extends LightningElement {

    menuItems = [{
        id: 1,
        name: 'Dashboard',
        url: '/artemtest2/s/',
        visible: true
    },{
        id: 2,
        name: 'Orders',
        url: '/artemtest2/s/orders',
        visible: true
    },{
        id: 3,
        name: 'Wholesale',
        url: '/artemtest2/s/wholesale',
        visible: true
    },{
        id: 4,
        name: 'Inventory',
        url: '/artemtest2/s/inventory',
        visible: true
    },{
        id: 5,
        name: 'Physicians',
        url: '/artemtest2/s/physicians',
        visible: true
    },{
        id: 6,
        name: 'Search',
        url: '/artemtest2/s/search',
        visible: false
    }];

    menuItemsFiltered = this.menuItems.filter( item => item.name !== 'Search');

    get isSearchPage() {
        console.log(window.location);
        return window.location.pathname.includes('/search');
    }

    onMenuItemSelect(e) {
        let navigateToMenuItem = this.menuItems.filter( item => 
            item.id == e.currentTarget.dataset.id
        );
        this.menuItemSelectExecutor(navigateToMenuItem[0]);
    }

    onSearchMenuItemSelect() {
        let navigateToSearchMenuItem = this.menuItems.filter( item => 
            item.name === 'Search'
        );
        this.menuItemSelectExecutor(navigateToSearchMenuItem[0]);
    }

    onDashboardMenuItemSelect() {
        let navigateToSearchMenuItem = this.menuItems.filter( item => 
            item.name === 'Dashboard'
        );
        this.menuItemSelectExecutor(navigateToSearchMenuItem[0]);
    }

    menuItemSelectExecutor(menuItem) {
        console.log(menuItem);
        window.location = menuItem.url;
    }

}