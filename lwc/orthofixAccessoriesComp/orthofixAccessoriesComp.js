import { LightningElement , track } from 'lwc';

export default class OrthofixAccessoriesComp extends LightningElement {

    @track deviceList = [{ id: 1, modelNumber: '', quantity: 0 }];
    @track accessoryList = [{ id: 1, modelNumber: '', quantity: 0 }];
    
    modelOptions = []; // Populate with model number options

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