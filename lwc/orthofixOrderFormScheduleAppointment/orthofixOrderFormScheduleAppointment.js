/**
 * @description       : 
 * @author            : Lokesh Kesava | lokesh.kesava@argano.com
 * @group             : 
 * @last modified on  : 03-21-2024
 * @last modified by  : Lokesh Kesava | lokesh.kesava@argano.com
**/
import { LightningElement, api, track } from 'lwc';

export default class OrthofixOrderFormScheduleAppointment extends LightningElement {
    @api disabled = false;
    @api formData;
    @api editedData;
    @api picklistOptions;
    @api requiredFields;
    @track formattedDateTime;
    @track selectedDate;
    @track selectedTime;
    @api makeEventReadOnly;
    ScheduleHeader = 'Schedule a Fitting Appointment';

    get patientName() {
        return (this.formData.patientInformation.firstName || this.formData.patientInformation.lastName) ? 
        `${this.formData.patientInformation.firstName} ${this.formData.patientInformation.lastName}` : 
        null;
    }
    
    
    get physicianName() {
        return (this.formData.patientInformation.prescriber.firstName || this.formData.patientInformation.prescriber.lastName) ? 
        `${this.formData.patientInformation.prescriber.firstName} ${this.formData.patientInformation.prescriber.lastName}` : 
        null;
    }
    
    @api scheduleHeaderfun() {
        this.ScheduleHeader = 'Fitting Appointment';
    }
    
    

    handleInputChange(event){
        let name = event.target.name;
        let value = event.target.value;
        this.dispatchEvent(new CustomEvent(
            'inputchange', {
                detail: {
                    fieldName: name,
                    value: value
                }
            }));
    }

    combinedDateTime() {
        if (this.selectedDate!=null && this.selectedTime !=null) {
            const date = new Date(this.selectedDate);
            const time = this.selectedTime.split(':');
            date.setHours(parseInt(time[0], 10));
            date.setMinutes(parseInt(time[1], 10));
            date.setSeconds(0); 
            date.setMilliseconds(0); 
            console.log('date converted' ,  date.toISOString());
            const dateValue =  date.toISOString();

            this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: 'eventInformation.appointmentdate', value: dateValue}}));
        }
       
    }

    handleDateChange(event) {
        this.selectedDate = event.target.value;
        console.log('this.selectedDate' ,  this.selectedDate);
        this.combinedDateTime();
    }

    handleTimeChange(event) {
        this.selectedTime = event.target.value;
        console.log('this.selectedTime' , this.selectedTime);
       this.combinedDateTime();
    }

    
    handleAddressChange(event){
        let name = event.target.name;
        console.log('name',name );
        this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: name+'.street', value: event.target.street}}));
        this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: name+'.city', value: event.target.city}}));
        this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: name+'.province', value: event.target.province}}));
        this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: name+'.country', value: event.target.country}}));
        this.dispatchEvent(new CustomEvent('inputchange', {detail: {fieldName: name+'.postalCode', value: event.target.postalCode}}));
    }

}