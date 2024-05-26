import { LightningElement, track, api } from 'lwc';

export default class OrthofixDevicesComp extends LightningElement {
    @api formData;
    @api picklistOptions;
    @api requiredFields;

    @track deviceList = [{ id: 0, modelNumber: '', liveOrDemo: '', quantity: 0 }];

    addDeviceRow() {
        const newId = this.deviceList.length > 0 ? this.deviceList[this.deviceList.length - 1].id + 1 : 0;
        const newDevice = {
            id: newId,
            modelNumber: '',
            liveOrDemo: '',
            quantity: 0
        };
        
        this.deviceList.push(newDevice);
        this.deviceList = [...this.deviceList]; // Update the array to trigger reactivity
        
        // Dispatch custom event with the new device data
        const addDeviceEvent = new CustomEvent('adddevice', { detail: { deviceList: this.deviceList } });
        this.dispatchEvent(addDeviceEvent);
    }

    deleteDeviceRow(event) {
        const index = event.target.dataset.id;
        this.deviceList.splice(index, 1);
        this.deviceList = [...this.deviceList]; // Update the array to trigger reactivity

        // Dispatch custom event with the updated device list
        const deleteDeviceEvent = new CustomEvent('deletedevice', { detail: { deviceList: this.deviceList } });
        this.dispatchEvent(deleteDeviceEvent);
    }

    handleModelChange(event) {
        const index = event.target.dataset.id;
        this.deviceList[index].modelNumber = event.detail.value;
        this.deviceList = [...this.deviceList]; // Update the array to trigger reactivity
    }

    handleQuantityChange(event) {
        const index = event.target.dataset.id;
        this.deviceList[index].quantity = event.detail.value;
        this.deviceList = [...this.deviceList]; // Update the array to trigger reactivity
    }

    handleLiveDemoChange(event) {
        const index = event.target.dataset.id;
        this.deviceList[index].liveOrDemo = event.detail.value;
        this.deviceList = [...this.deviceList]; // Update the array to trigger reactivity
    }

    get isAddButtonDisabled() {
        const lastDevice = this.deviceList[this.deviceList.length - 1];
        return !lastDevice.modelNumber || lastDevice.quantity <= 0;
    }
}