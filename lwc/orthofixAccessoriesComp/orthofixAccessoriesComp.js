import { LightningElement , track , api} from 'lwc';

export default class OrthofixAccessoriesComp extends LightningElement {

    @api formData;
    @api picklistOptions;
    @api requiredFields;

    @track deviceList = [{ id: 1, modelNumber: '', quantity: 0 }];
    @track accessoryList = [{ id: 1, modelNumber: '', quantity: 0 }];
    
    accessoriesOptions = [
        { label: 'CS 5505 - Comfort Collar', value: 'CS 5505' },
        { label: 'PS 5302 - Sure Fit Cushion (small)', value: 'PS 5302' },
        { label: 'PS 5302/5303 Optional Long Strap', value: 'PS 5302/5303' },
        { label: 'PS 5302/5303 - Replaceable Velcro Strap', value: 'PS 5302/5303 Velcro' },
        { label: 'PS 5303 - Sure Fit Cushion (large)', value: 'PS 5303' },
        { label: 'PS 5313 – Short Velcro Strap', value: 'PS 5313' },
        { label: 'PS 5313/5314 - Replaceable Strap (long)', value: 'PS 5313/5314' },
        { label: 'PS 5315 - Replaceable Strap', value: 'PS 5315' },
        { label: 'SS 5212 - Suspenders', value: 'SS 5212' }
    ]; 
    addDeviceRow() {
        const newId = this.deviceList.length + 1;
        this.deviceList = [
            ...this.deviceList,
            { id: newId, modelNumber: '', quantity: 0, showDelete: true }
        ];
    }
    deleteDeviceRow(event) {
        const index = event.currentTarget.dataset.id;
        if (this.deviceList.length > 1) {
            this.deviceList = this.deviceList.filter((_, idx) => idx !== parseInt(index));
        }
        if (this.deviceList.length === 1) {
            // Ensure the delete button is not shown for the only row
            this.deviceList[0].showDelete = false;
        }
    }

    handleModelChange(event) {
        const index = event.target.dataset.index;
        this.deviceList[index].modelNumber = event.detail.value;
        this.deviceList = [...this.deviceList]; 
    }

    handleQuantityChange(event) {
        // Retrieve the index using event's dataset property
        const index = parseInt(event.target.dataset.index, 10);

        // Check if the retrieved index is within the bounds of the deviceList array
        if (index >= 0 && index < this.deviceList.length) {
            // Clone the deviceList array to maintain immutability and reactivity
            let updatedList = [...this.deviceList];
            
            // Convert the input value to a number and update the quantity for the device
            updatedList[index] = { ...updatedList[index], quantity: parseInt(event.detail.value, 10) };
            
            // Update the deviceList with the new array to trigger the reactive update
            this.deviceList = updatedList;
        } else {
            // Handle the error case where index is not valid
            console.error('Invalid index for quantity change');
        }
    }

     get isAddButtonDisabled() {
        const lastDevice = this.deviceList[this.deviceList.length - 1];
        return !lastDevice.modelNumber || lastDevice.quantity <= 0;
    }
}